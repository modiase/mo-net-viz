import { Chart as ChartJS, registerables } from 'chart.js';
import Loading from 'components/Loading';
import h5wasm from 'h5wasm';
import { useEffect, useState } from 'react';
import MainScreen from 'screens/MainScreen';
import './App.css';

ChartJS.register(...registerables);

interface H5wasmState {
  FS: FS.FileSystemType;
}

const useH5wasmState = (): H5wasmState | null => {
  const [_state, _setState] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { FS } = await h5wasm.ready;
      _setState({ FS });
    })();
  }, []);
  return _state;
};

function App() {
  const h5wasmState = useH5wasmState();
  return <div className="App">{h5wasmState === null ? <Loading /> : <MainScreen FS={h5wasmState.FS} />}</div>;
}

export default App;
