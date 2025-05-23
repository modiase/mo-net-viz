import h5wasm, { FS, File as H5File } from 'h5wasm';
import React, { useState } from 'react';



type Step = 'selectFile' | 'loadFile' | 'loadingFile' | 'selectIteration' | 'viewIteration';
const DEFAULT_STEP: Step = 'selectFile';
interface FileSelectorStepGeneric<S extends Step, N extends Step, F extends File | H5File | null, NF extends File | H5File, I extends string | null> {
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
type LoadFileStep = FileSelectorStepGeneric<'loadFile', 'loadingFile' | 'selectFile' | 'selectIteration', File, H5File, null>;
type LoadingFileStep = FileSelectorStepGeneric<'loadingFile', 'selectIteration' | 'selectFile', File, H5File, null>;
type SelectIterationStep = FileSelectorStepGeneric<'selectIteration', 'viewIteration' | 'selectFile', H5File, H5File, null>;
type ViewIterationStep = FileSelectorStepGeneric<'viewIteration', 'selectFile', H5File, H5File, string>;
type FileSelectorStep = SelectFileStep | LoadFileStep | LoadingFileStep | SelectIterationStep | ViewIterationStep;


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
    }

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
}

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

const CurrentStep = ({ fileSelectorStep }: { fileSelectorStep: FileSelectorStep }) => {
    switch(fileSelectorStep.current) {
        case 'selectFile':
            return (<><h2>Select File</h2>
            <input type="file" accept=".hdf5,.h5" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                fileSelectorStep.setFile(file);
                fileSelectorStep.setStep('loadFile');
            }} />
            </>)
        case 'loadFile':
            return (<><p>{fileSelectorStep.file.name}</p>
            <button onClick={() => loadFile(fileSelectorStep)}>Load File</button>
            </>)
        case 'loadingFile':
            return (<>
            <p>Loading file...</p>
            </>)
        case 'selectIteration':
            return (<><h2>Select an iteration</h2>
            <select onChange={(e) => {
                const selectedIteration = e.target.value;
                fileSelectorStep.setIteration(selectedIteration);
            }}>
                <option value="">-- Select an iteration --</option>
                {fileSelectorStep.keys.filter(key => key.startsWith('iteration')).map(key => 
                    <option key={key} value={key}>{key}</option>
                )}
            </select>
            </>)

        default:
            return <div>Unknown Step: {fileSelectorStep.current}</div>
    }
}

const FileSelector = ({ FS }: { FS: FS.FileSystemType }) => {
    const fileSelectorStep = useFileSelectorStep(FS);


    return (
        <div>
            <h1>File Selector</h1>
            { fileSelectorStep.file && <button onClick={() => fileSelectorStep.clear()}>Clear</button> }
            <CurrentStep fileSelectorStep={fileSelectorStep} />
        </div>
    );
}

export default FileSelector;