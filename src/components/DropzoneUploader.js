import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import AWS from 'aws-sdk';

const DropzoneComponent = () => {
  const [files, setFiles] = useState([]);

  // Configure the AWS SDK
  AWS.config.update({
    accessKeyId: 'XX',
    // Your secret access key goes here in place of 'YOUR_SECRET_ACCESS_KEY'
    secretAccessKey: 'XX'
  });

  const s3 = new AWS.S3();

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    // Upload files to S3
    acceptedFiles.forEach(file => uploadFile(file));
  };

  const handleUpload = () => {
  // Upload files directly to S3
  files.forEach(file => {
    uploadFile(file);
  });

  };


  const uploadFile = (file) => {
    const params = {
      Bucket: 'dicomuploads1', // The name of your S3 bucket
      Key: file.name, // The name of the file to be saved in the bucket
      Body: file, // The file itself
      ContentType: file.type // The content type of the file, e.g., image/jpeg
    };
  
    s3.upload(params, function (err, data) {
      if (err) {
        console.error('There was an error uploading your file: ', err);
        return;
      }
      console.log('Successfully uploaded file.', data);
    });
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
        {/* Button to initiate the upload */}
        {files.length > 0 && (
            <button onClick={handleUpload}>Upload Files</button>
      )}
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
