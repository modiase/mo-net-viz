import Button from 'components/Button';
import Dropdown from 'components/Dropdown';
import FileSelector from 'components/FileSelector';
import h5wasm, { File as H5File, type Group } from 'h5wasm';
import { useMemo, useState } from 'react';
import TrainingIteration from './TrainingIteration';

type Step = 'selectFile' | 'loadFile' | 'loadingFile' | 'selectIteration' | 'viewIteration';
interface FileSelectorStepGeneric<
  S extends Step,
  N extends Step,
  F extends File | H5File | null,
  NF extends File | H5File,
  I extends string | null,
> {
  current: S;
  setStep: (step: N) => void;
  file: F;
  setFile: (file: NF) => void;
  keys: string[];
  setKeys: (keys: string[]) => void;
  FS: FS.FileSystemType;
  iteration: I;
  setIteration: (iteration: string | null) => void;
  clear: () => void;
}

type SelectFileStep = FileSelectorStepGeneric<'selectFile', 'loadFile', null, File, null>;
type LoadFileStep = FileSelectorStepGeneric<
  'loadFile',
  'loadingFile' | 'selectFile' | 'selectIteration',
  File,
  H5File,
  null
>;
type LoadingFileStep = FileSelectorStepGeneric<'loadingFile', 'selectIteration' | 'selectFile', File, H5File, null>;
type SelectIterationStep = FileSelectorStepGeneric<
  'selectIteration',
  'viewIteration' | 'selectFile',
  H5File,
  H5File,
  null
>;
type ViewIterationStep = FileSelectorStepGeneric<
  'viewIteration',
  'selectIteration' | 'selectFile',
  H5File,
  H5File,
  string
>;
type FileSelectorStep = SelectFileStep | LoadFileStep | LoadingFileStep | SelectIterationStep | ViewIterationStep;

const DEFAULT_STEP: Step = 'selectFile';
const useFileSelectorStep = (FS: FS.FileSystemType): FileSelectorStep => {
  const [step, setStep] = useState<FileSelectorStep['current']>(DEFAULT_STEP);
  const [file, setFile] = useState<File | H5File | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const [iteration, setIteration] = useState<string | null>(null);

  const clear = () => {
    setStep(DEFAULT_STEP);
    setFile(null);
    setKeys([]);
    setIteration(null);
  };

  const baseReturn = { current: step, setStep, file, setFile, keys, setKeys, FS, iteration, setIteration, clear };

  switch (step) {
    case 'selectFile':
      return { ...baseReturn, file: null, iteration: null } as SelectFileStep;
    case 'loadFile':
    case 'loadingFile':
      return baseReturn as LoadFileStep | LoadingFileStep;
    case 'selectIteration':
      return baseReturn as SelectIterationStep;
    case 'viewIteration':
      return baseReturn as ViewIterationStep;
    default:
      throw new Error(`Unknown step: ${step}`);
  }
};

const loadFile = (fileSelectorStep: LoadFileStep) => {
  (async () => {
    const file = fileSelectorStep.file;
    if (file === null) return;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    fileSelectorStep.FS.writeFile('data.hdf5', uint8Array);
    const h5file = new h5wasm.File('data.hdf5', 'r');
    fileSelectorStep.setFile(h5file);
    fileSelectorStep.setKeys(h5file.keys());
    fileSelectorStep.setStep('selectIteration');
  })();
};

const IterationSelector = ({ fileSelectorStep }: { fileSelectorStep: SelectIterationStep | ViewIterationStep }) => {
  return (
    <>
      <Dropdown
        options={fileSelectorStep.keys}
        value={fileSelectorStep.iteration || ''}
        optionFilter={(key: string | { value: string; label: string }) =>
          typeof key === 'string' && key.startsWith('iteration')
        }
        placeholder="-- Select an iteration --"
        onChange={(selectedIteration: string) => {
          fileSelectorStep.setIteration(selectedIteration);
          if (fileSelectorStep.current === 'selectIteration') fileSelectorStep.setStep('viewIteration');
        }}
      />
    </>
  );
};

const CurrentStep = ({ fileSelectorStep }: { fileSelectorStep: FileSelectorStep }) => {
  const ClearFileButton = useMemo(() => {
    return () => {
      return <Button onClick={() => fileSelectorStep.clear()}>Clear</Button>;
    };
  }, [fileSelectorStep]);
  const current = fileSelectorStep.current;
  switch (current) {
    case 'selectFile':
      return (
        <div className="flex flex-col items-center justify-center">
          <FileSelector
            onFileSelect={(file) => {
              if (!file) return;
              fileSelectorStep.setFile(file);
              fileSelectorStep.setStep('loadFile');
            }}
            accept=".hdf5,.h5"
            placeholder="Select HDF5 file"
          />
        </div>
      );
    case 'loadFile':
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <p>Current file: {fileSelectorStep.file.name}</p>
          <Button onClick={() => loadFile(fileSelectorStep)}>Load File</Button>
          <ClearFileButton />
        </div>
      );
    case 'loadingFile':
      return (
        <>
          <p>Loading file...</p>
        </>
      );
    case 'selectIteration':
      return (
        <>
          <ClearFileButton />
          <IterationSelector fileSelectorStep={fileSelectorStep} />
        </>
      );

    case 'viewIteration':
      const iteration: Group | null = fileSelectorStep.file.get(fileSelectorStep.iteration) as Group | null;
      if (iteration === null) return <div>Iteration not found</div>;
      return (
        <>
          <ClearFileButton />
          <IterationSelector fileSelectorStep={fileSelectorStep} />
          <TrainingIteration iteration={iteration} />
        </>
      );
    default:
      return <div>Unknown Step: {current}</div>;
  }
};

const MainScreen = ({ FS }: { FS: FS.FileSystemType }) => {
  const fileSelectorStep = useFileSelectorStep(FS);

  return (
    <>
      <h1 className="text-2xl font-bold text-center gap-4 p-4">Mo-Net Visualizer</h1>
      <CurrentStep fileSelectorStep={fileSelectorStep} />
    </>
  );
};

export default MainScreen;
