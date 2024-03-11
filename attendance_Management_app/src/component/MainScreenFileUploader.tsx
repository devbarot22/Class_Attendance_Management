import Papa from 'papaparse';
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getStorage } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseconfig';
import { app } from '../firebaseconfig';



const MainScreenFileUploader: React.FC = () => {

  const [authUser, setAuthUser] = useState<typeof user | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return () => unsubscribe();
  }, []);



  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Array<{ [key: string]: string }>>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');


  const { user } = useContext(UserContext) as { user: any };






  const parseAndDisplayData = (content: string) => {
    // Parse the File content using Papaparse
    const parsedData = Papa?.parse(content, { header: true });


    const headers = parsedData?.meta?.fields;
    let rows = parsedData?.data as { [key: string]: string }[]; // Explicitly type rows as an array of objects with string keys and string values


    if (rows && rows.length > 0 && Object.values(rows[rows.length - 1]).every(value => !value)) {
      rows = rows.slice(0, -1);
    }
    // Extract column headers and data rows
    const updatedHeaders = [...(headers || [])];
    setTableHeaders(updatedHeaders);

    setFileData(rows);
  }





  //Uploads the file in firebase storage

  const uploadFile = () => {
    if (!file) {
      console.log('No File Selected');
      toast.error('No File Selected');
      return
    }
    const storage = getStorage(app);
    const storageRef = ref(storage);
    const userFileRef = ref(storageRef, `uploads/${authUser?.uid}/${file?.name}`);

    uploadBytes(userFileRef, file).then(() => {
      console.log('File uploaded successfully');
      toast.success('File uploaded successfully');
    }).catch((error) => {
      console.error('Error uploading file: ', error);
      toast.error('Error uploading file');
    })
  };





  function handleFileUpload(event: { target: { files: FileList }; }) {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e?.target?.result as string;
        parseAndDisplayData(content);
      }

      reader?.readAsText(event.target.files[0]);
      reader.onerror = function (error) {
        console.error('Error reading file: ', error);
        toast.error('Error reading file');
      };
    }
  }














  const handleAttendanceChange = (rowIndex: number, status: 'Present' | 'Absent') => {
    // Create a new array with the same values as fileData
    const newFileData = [...fileData];

    // Update the Attendance value of the row at rowIndex
    newFileData[rowIndex]['Attendance'] = status;

    // Update the state
    setFileData(newFileData);
  };









  const handleAddClass = async () => {
    const newClass = prompt('Enter The New Class....Eg.:9th-A or 9th_A');
    if (newClass) {
      setClasses(prevClasses => [...prevClasses, newClass]);
      if (authUser && authUser.uid) {
        const docRef = doc(db, `users/${authUser.uid}/classes/${newClass}`);
        await setDoc(docRef, {}).catch((error) => {
          console.error('Error adding class: ', error);
          toast.error('Error adding class');
        });
        toast?.success("Class stored successfully!"); // Display a success toast
      } else {
        console.error('No user is signed in');
        toast.error('No user is signed in');
      }
      getAllClassesFromIndexedDB()
    }
  };








  const handleDeleteClass = async (classToDelete: string) => {
    //Remove class from local state
    if (!classToDelete || !window.confirm(`Are you sure you want to delete ${classToDelete} class?`)) {
      toast.error('There is no class in there you blind ass');
      return;
    }

    setClasses(classes => classes.filter(className => className !== classToDelete));

    // Update selectedClass to be an empty string
    setSelectedClass('');

    setClasses(classes => classes.filter(className => className !== classToDelete));


    //Remove class from firestore
    try {
      const docRef = doc(db, `users/${authUser.uid}/classes/${classToDelete}`);
      await deleteDoc(docRef);
      toast.info("Class deleted successfull!");
    } catch (error) {
      console.error('Error delete class:', error);
      toast.error("Error deleting class");
    }
    deleteFromIndexedDB(classToDelete);
  }











  const handleClassChange = async (e: any) => {
    const newClass = e?.target?.value;
    setSelectedClass(newClass);

    if (authUser && authUser.uid) {
      try {
        const firestoreData = await getFirestoreTableData(authUser.uid, newClass);
        setFileData(firestoreData);
      } catch (firestoreError) {
        console.error(`Error getting Firestore table data: ${firestoreError}`);
        try {
          const indexedDBData = await getIndexedDBTableData(newClass);
          setFileData(indexedDBData);
        } catch (indexedDBError) {
          console.error(`Error getting IndexedDB table data: ${indexedDBError}`);
          setFileData([]);
        }
      }
    } else {
      console.error('No user is signed in');
      setFileData([]);
    }
  };






  const saveData = async () => {
    if (!authUser || !authUser.uid) {
      console.error('authUser is not defined');
      toast.error('Unable to fetch your data');
      return;
    }

    await uploadFile();

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const docRef = doc(db, `users/${authUser.uid}/classes/${selectedClass}`);// Fix the type of selectedClass
      await setDoc(docRef, { tableData: fileData }, { merge: true }).catch((error) => {
        console.error('Error saving data: ', error);
        toast.error('Error saving data');
      });
      console.log('saved fileData', fileData)
      toast.success(`Data stored successfully in ${selectedClass}`);
      setTimeout(() => {
        postMessage('');
      }, 3000);
      addToIndexedDB(selectedClass);
    }

  };




  async function getFirestoreTableData(userUID: string, className: string | undefined) {
    if (!className) {
      throw new Error('Class name is not provided');
    }
    const docRef = doc(db, 'users', userUID, 'classes', className);
    const docSnap = await getDoc(docRef);

    console.log('Firestore document data:', docSnap.data());
    if (docSnap?.exists()) {
      return docSnap?.data()?.tableData ?? [];
    } else {
      throw new Error(`No Firestore data exists for class ${className}`);
    }
  }









  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    handleClassChange(e);
  };



  //IndexedDB code 







  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('school_database', 1);

      request.onerror = () => {
        reject('Failed to open database');
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        // Create object store
        db.createObjectStore('classes', { keyPath: 'className' });
      };
    });
  };








  useEffect(() => {
    openDB().then(db => {
      // Database opened successfully, you can perform operations here
    }).catch(error => {
      console.error(error);
    });
  }, []);








  // Function to add data to IndexedDB
  const getAllClassesFromIndexedDB = () => {
    openDB().then(db => {
      const transaction = db.transaction('classes', 'readwrite');
      const objectStore = transaction.objectStore('classes');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        if (request.result) {
          console.log('All data retrieved from IndexedDB');
          console.log(request.result); // This will be an array of all the classes
        } else {
          console.log('No data retrieved from IndexedDB');
        }
      };

      request.onerror = () => {
        console.error('Failed to retrieve data from IndexedDB');
      };
    }).catch(error => {
      console.error(error);
    });
  };








  // Function to retrieve data from IndexedDB
  async function getIndexedDBTableData(className: string | undefined) {
    if (!className) {
      throw new Error('Class name is not provided');
    }
    try {
      const db = await openDB();
      const transaction = db.transaction('classes', 'readonly');
      const objectStore = transaction.objectStore('classes');
      const request = objectStore.get(className);

      return new Promise<any>((resolve, reject) => {
        request.onsuccess = () => {
          const data = request.result?.tableData ?? [];
          console.log('IndexedDB data:', data);
          resolve(data);
        };

        request.onerror = () => {
          console.error('Error getting data from IndexedDB');
          reject(new Error('Failed to retrieve data from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error opening IndexedDB:', error);
      throw new Error('Failed to open IndexedDB');
    }
  }








  // Function to delete data from IndexedDB
  const deleteFromIndexedDB = (className: string) => {
    openDB().then(db => {
      const transaction = db.transaction('classes', 'readwrite');
      const objectStore = transaction.objectStore('classes');
      const request = objectStore.delete(className);

      request.onsuccess = () => {
        console.log('Data deleted from IndexedDB');
      };

      request.onerror = () => {
        console.error('Failed to delete data from IndexedDB');
      };
    }).catch(error => {
      console.error(error);
    });
  };







  const addToIndexedDB = (className: string) => {
    openDB().then(db => {
      const transaction = db.transaction('classes', 'readwrite');
      const objectStore = transaction.objectStore('classes');
      const request = objectStore.add({ className });

      request.onsuccess = () => {
        console.log('Data added to IndexedDB');
      };

      request.onerror = () => {
        console.error('Failed to add data to IndexedDB');
      };
    }).catch(error => {
      console.error(error);
    });
  };




  //IndexedDB code Ends here.  

















  const fileInputRef = React.useRef(null);
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-x-auto relative ">
      <div className='relative h-24 w-[88vw]  '>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload as unknown as ChangeEventHandler<HTMLInputElement>}
        />
        <div className='flex justify-start items-center'>
          <select className='absolute bottom-1' value={selectedClass}
            onChange={handleSelectChange}>
            {classes.map((className, index) => (
              <option key={index} value={className}>{className}</option>
            ))}
          </select>
          <div className=' flex'>
            <button onClick={handleAddClass} className='absolute bottom-1 bg-gray-400 ml-20 inline-flex'><FaPlus /></button>
            <button onClick={() => handleDeleteClass(selectedClass)} className='absolute bottom-1  bg-gray-400 ml-[3.7rem] inline-flex'><FaTimes /></button>
          </div>
        </div>
        <div className='flex justify-center items-center'>
          <button onClick={() => (fileInputRef?.current as unknown as HTMLInputElement)?.click()} className='bg-gray-400 w-fit absolute bottom-1 right-16 rounded-[5px] px-2 py-px mt-10'>Upload CSV</button>
          <button onClick={saveData} className=' bg-gray-400 w-fit px-2 py-px mt-10 right-1 bottom-1 absolute rounded-[5px]'>Save</button>
        </div>
      </div>
      <table className="w-[88vw] table-auto border border-gray-300">
        <thead className="border border-gray-300 py-4 px-4  whitespace-nowrap">
          <tr className="">
            <th colSpan={2}>Attendance</th>
            {tableHeaders?.map((header, index) => {
              return <th key={index} rowSpan={2}>{header}</th>
            })}
          </tr>
          <tr>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody className="w-60 h-44">
          {fileData?.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200">
              <td className="py-2 text-center border-r border-gray-300">
                {fileData.length > 0 && (
                  <div className="flex justify-center">
                    <input
                      type='radio'
                      name={`attendance-${rowIndex}`}
                      checked={row['Attendance'] === 'Present'}
                      title='Present'
                      onChange={() => handleAttendanceChange(rowIndex, 'Present')}
                    />
                  </div>
                )}
              </td>
              <td className="py-2 text-center border-r border-gray-300">
                {fileData.length > 0 && (
                  <div className="flex justify-center">
                    <input
                      type='radio'
                      name={`attendance-${rowIndex}`}
                      checked={row['Attendance'] === 'Absent'}
                      title='Absent'
                      onChange={() => handleAttendanceChange(rowIndex, 'Absent')}
                    />
                  </div>
                )}
              </td>
              {tableHeaders?.map((header: string, cellIndex: React.Key | null | undefined) => (
                <td className="py-2 px-4 w-1/4 text-center border-r border-gray-300" key={cellIndex}>
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MainScreenFileUploader;


