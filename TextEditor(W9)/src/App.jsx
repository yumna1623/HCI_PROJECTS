import { useState } from 'react';
import PreferenceForm from './components/PreferenceForm/PreferenceForm';
import Editor from './components/Editor/Editor';
import { EditorProvider } from './context/EditorContext';

export default function App() {
  const [config, setConfig] = useState(null);

  if (!config) {
    return <PreferenceForm onSubmit={setConfig} />;
  }

  return (
    <EditorProvider config={config}>
      <Editor />
    </EditorProvider>
  );
}