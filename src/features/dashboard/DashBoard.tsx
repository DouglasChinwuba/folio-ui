import axios from 'axios'
import log from 'loglevel'
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'
import { useNavigate } from 'react-router-dom';
import ListDocument from './ListDocument.tsx'

// After upload is clicked
// gets presigned url with object_name and type
// used presigned url to upload to s3 bucket

log.setLevel("info");

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function uploadFile(getPresignedUrlresponse : any , file : File){
  try{
    log.info(`Uploading file: ${file.name}`)
    const s3Response = await axios.put(getPresignedUrlresponse.presigned_url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })

    log.info("Successfully uploaded document")
    log.info(s3Response)

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    const documentDbResponse = await axios.post(`${API_BASE_URL}/api/v1/endpoints/documents`, {
      filename: file.name,
      s3_key: getPresignedUrlresponse.s3_key,
      content_type: file.type,
    },{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    log.info(`Successfully loaded document:`, documentDbResponse);
    
  }catch(error){
    log.error("Error occurred: ", error)
  }
}


async function handleSubmit(event : React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  
  const form = event.target as HTMLFormElement;
  const fileInput = form.elements.namedItem("fileInput") as HTMLInputElement;


  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const filename = file.name;
    const fileType = file.type;

    try{
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      log.info(`Fetching presigned URL`);
      const getPresignedUrlresponse = await axios.get(`${API_BASE_URL}/api/v1/endpoints/generate_presigned_url`,
        {
          params: {
            filename: filename,
            expiration: 100,
            content_type: fileType,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      log.info(`Presigned URL received successfully for file: ${filename}`);
      await uploadFile(getPresignedUrlresponse.data, file);
      
    }catch(error){
      log.error("Error occurred: ", error)
    }
  }
}


function Dashboard(){

  const navigate = useNavigate();

  const handleLogout = async() => {
    try{
      await signOut(auth);
      localStorage.removeItem('user');  
      navigate("/");
    }catch(error){
      log.error("Error signing out:", error);
    }
  }

  return (
    <>
      <h1>This is the dashboard page</h1>

      <form onSubmit={handleSubmit}>
        <input type="file" name="fileInput"/>
        <button type="submit">Upload</button>
      </form>

      <>
        <ListDocument />
      </>

      <button onClick={handleLogout}>
        Logout
      </button>
    </>
  )
}

export default Dashboard;