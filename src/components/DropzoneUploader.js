import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DropzoneComponent = () => {
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true // Disables the click event on the dropzone
  });

  const openFileDialog = (fileInput) => {
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="App">
      <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px' }}>
        <input {...getInputProps()} />
        <button type="button" onClick={() => openFileDialog(document.getElementById('fileInput'))}>
          Select Files
        </button>
        <button type="button" onClick={() => openFileDialog(document.getElementById('dirInput'))}>
          Select Folder
        </button>
        <input id="fileInput" type="file" style={{ display: 'none' }} multiple onChange={e => onDrop([...e.target.files])} />
        <input id="dirInput" type="file" style={{ display: 'none' }} webkitdirectory="" directory="" onChange={e => onDrop([...e.target.files])} />
        <p>Drag 'n' drop files or folders here.</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          {files.map(file => (
            <li key={file.path}>
              {file.path} - {file.size} bytes
              <button onClick={() => {
                // Revoke the object URL and remove file from state
                URL.revokeObjectURL(file.preview);
                setFiles(prevFiles => prevFiles.filter(f => f !== file));
              }}>Remove File</button>
              {file.type.startsWith('image/') && (
                <img src={file.preview} style={{ width: '50px' }} alt="Preview" />
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default DropzoneComponent;
