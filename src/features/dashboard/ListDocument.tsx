import axios from 'axios'
import { useEffect, useState } from "react";
import log from "loglevel";

log.setLevel("info");

interface Document {
    id: string;
    filename: string;
    created_at: string;
    s3_key: string;
  }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleDelete(document_id: string, setDocuments: React.Dispatch<React.SetStateAction<Document[]>>) {

    try{
        const token = localStorage.getItem("token");
    if (!token) {
        log.error("No auth token found");
        return;
    }

    const response = await axios.delete(`${API_BASE_URL}/api/v1/endpoints/documents/${document_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    setDocuments(prev => prev.filter(doc => doc.id !== document_id));
    log.info(response.data);
    }catch(err){
        log.error("Error deleting document:", err);
    }
    
}

function ListDocument(){
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    const userString = localStorage.getItem('user');

    if(userString){
        const user = JSON.parse(userString); 
        user.user_id
    }
    
    useEffect(() => {
        const fetchDocuments = async () => {
            try{
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/api/v1/endpoints/get_documents`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                );

                setDocuments(response.data);
            }catch(err: any){
                log.error("Error fetching documents:", err);
                setError("Failed to fetch documents");
            }finally{
                setLoading(false);
            }
        };

        fetchDocuments();

    }, []);
    
    if (loading) return <p>Loading documents...</p>;
    if (error) return <p>{error}</p>;
    if (documents.length === 0) return <p>No documents found.</p>;

    return (
        <>
            <ul>
                {documents.map( doc => (
                    <li key={doc.id}>
                        <img src="/src/assets/icons/gray-file-icon.png"/>
                        <strong>{doc.filename}</strong> 
                        {/* <em>({new Date(doc.created_at).toLocaleString()})</em> */}
                        <button onClick={() => handleDelete(doc.id, setDocuments)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default ListDocument;