import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import AWS from 'aws-sdk';

const DropzoneComponent = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // New state to track upload status
  const [uploadSuccess, setUploadSuccess] = useState(false); // New state to track if upload was successful
  const [session, setSession] = useState('');
  const [subject, setSubject] = useState(''); 

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
  };

  const handleUpload = () => {
    const subjectRegex = /^\d{3}-\d{3}$/; // Regex for validating subject format ###-###

    if (!session) {
      alert("Please select a session.");
      return;
    }

    if (!subjectRegex.test(subject)) {
      alert("Subject must be in the format ###-###.");
      return;
    }
    
    
    
    if (!session || !subject) {
        alert("Please enter both session and subject metadata.");
        return;
      }
  
    setIsUploading(true); // Indicate the start of the upload
    setUploadSuccess(false); // Reset the success flag at the start of each upload
  
    // Use Promise.all to wait for all file uploads to complete
    Promise.all(files.map(file => uploadFile(file)))
      .then(() => {
        setUploadSuccess(true); // Set upload success to true when all uploads are successful
        setIsUploading(false); // Set uploading to false when all uploads are done
      })
      .catch(error => {
        console.error('Error uploading files: ', error);
        setIsUploading(false); // Set uploading to false on error
      });
  };


  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const folderName = `${session}_${subject}`;
      const params = {
        Bucket: 'dicomuploads1',
        Key: `${folderName}/${file.name}`,
        Body: file,
        ContentType: file.type
      };
  
      s3.upload(params, function (err, data) {
        if (err) {
          console.error('There was an error uploading your file: ', err);
          reject(err);
        } else {
          console.log('Successfully uploaded file.', data);
          resolve(data);
        }
      });
    });
  };
    
  

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        noClick: true // Disables the click event on the dropzone
      });

  function openFileDialog(fileInput) {
        if (fileInput) {
            fileInput.click();
        }
    }

  

    return (
        <div className="App">
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="">Select Session</option>
            <option value="BL">BL</option>
            <option value="FU">FU</option>
          </select>
          <input
            type="text"
            placeholder="Subject (###-###)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
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
            <p>Drag 'n' drop files or folders here, or use the buttons to select files/folders.</p>
            {files.length > 0 && (
              <button onClick={handleUpload} disabled={isUploading}>Upload Files</button>
            )}
            {isUploading && <p>Uploading...</p>}
            {!isUploading && uploadSuccess && <p>Upload successful!</p>}
          </div>
          <aside>
            <h4>Files</h4>
            <ul>
              {files.map(file => (
                <li key={file.path}>
                  {file.path} - {file.size} bytes
                  <button onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    setFiles(prevFiles => prevFiles.filter(f => f !== file));
                  }}>Remove File</button>
                  {file.type.startsWith('image/') && <img src={file.preview} style={{ width: '50px' }} alt="Preview" />}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      );
    };

export default DropzoneComponent;
