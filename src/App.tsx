import React, { use, useEffect, useState } from 'react';
import './App.css';
import h5wasm from 'h5wasm';
import FileSelector from 'screens/FileSelector';
import Loading from 'components/Loading';

import type { FS } from 'h5wasm';

interface H5wasmState {
  FS: FS.FileSystemType;
}

const useH5wasmState = () => {
  const [_state, _setState] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { FS } = await h5wasm.ready;
      _setState({ FS });
    })();
  }, []);
  return _state;
}


function App() {
  const h5wasmState = useH5wasmState();
  return (
      <div className="App">
        {h5wasmState === null ? <Loading /> : <FileSelector FS={h5wasmState.FS} />}
      </div>
  );
}

export default App;
