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
      <h2>Select an iteration</h2>
      <select
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer min-w-[200px]"
        onChange={(e) => {
          const selectedIteration = e.target.value;
          fileSelectorStep.setIteration(selectedIteration);
          if (fileSelectorStep.current === 'selectIteration') fileSelectorStep.setStep('viewIteration');
        }}
      >
        <option value="" className="text-gray-500">
          -- Select an iteration --
        </option>
        {fileSelectorStep.keys
          .filter((key) => key.startsWith('iteration'))
          .map((key) => (
            <option key={key} value={key} className="text-gray-900">
              {key}
            </option>
          ))}
      </select>
    </>
  );
};

const CurrentStep = ({ fileSelectorStep }: { fileSelectorStep: FileSelectorStep }) => {
  const ClearFileButton = useMemo(() => {
    return () => {
      return <button onClick={() => fileSelectorStep.clear()}>Clear</button>;
    };
  }, [fileSelectorStep]);
  const current = fileSelectorStep.current;
  switch (current) {
    case 'selectFile':
      return (
        <>
          <h2>Select File</h2>
          <input
            type="file"
            accept=".hdf5,.h5"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              fileSelectorStep.setFile(file);
              fileSelectorStep.setStep('loadFile');
            }}
          />
        </>
      );
    case 'loadFile':
      return (
        <>
          <p>{fileSelectorStep.file.name}</p>
          <button onClick={() => loadFile(fileSelectorStep)}>Load File</button>
          <ClearFileButton />
        </>
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
    <div>
      <h1>Mo-Net Visualizer</h1>
      <CurrentStep fileSelectorStep={fileSelectorStep} />
    </div>
  );
};

export default MainScreen;
