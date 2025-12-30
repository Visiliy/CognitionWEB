import { useState } from 'react';
import ChatInput from './components/JS/Chat-input.jsx';
import Heads from './components/JS/Heads.jsx';
import EnterForm from './components/JS/EnterForm.jsx';

function App() {
  const [isEnterWindowOpen, setIsEnterWindowOpen] = useState(true);

  const toggleEnterWindow = () => {
    setIsEnterWindowOpen(prev => !prev);
  };

  return (
    <>
      <Heads openEnterWindow={toggleEnterWindow} />
      {isEnterWindowOpen ? <ChatInput /> : <EnterForm />}
    </>
  );
}

export default App;
