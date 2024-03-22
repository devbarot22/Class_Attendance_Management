import Papa from 'papaparse';
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseconfig';



const MainScreenFileUploader: React.FC = () => {

  const [authUser, setAuthUser] = useState<typeof user | null>(null);




  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Array<{ [key: string]: string }>>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>(['']);
  const [selectedClass, setSelectedClass] = useState<string>('');


  const { user } = useContext(UserContext) as { user: any };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!authUser) {
          console.error("Authentication user not found.");
          return;
        }

        const dataRef = collection(db, `users/${authUser.uid}/classes`);

        const classSnapshot = await getDocs(dataRef);
        const classList: { id: string, name: string }[] = [{ id: 'Class', name: 'Classes' }];
        classSnapshot.forEach(doc => {
          classList.push({ id: doc.id, name: doc.id });
        });

        setClasses(classList.map(item => item.name));

        if (classList.length > 0) {
          setSelectedClass(classList[0].name);
          // await fetchData(classList[0].name);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    if (authUser) {
      fetchClasses();
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return () => unsubscribe();
  }, [authUser]);





  const parseAndDisplayData = (content: string) => {
    const parsedData = Papa?.parse(content, { header: true });

    const headers = parsedData?.meta?.fields;
    let rows = parsedData?.data as { [key: string]: string }[];

    if (rows && rows.length > 0 && Object.values(rows[rows.length - 1]).every(value => !value)) {
      rows = rows.slice(0, -1);
    }
    const updatedHeaders = [...(headers || [])];
    setTableHeaders(updatedHeaders);

    setFileData(rows);
  };





  //Uploads the file in firebase storage


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
    const newFileData = [...fileData];

    newFileData[rowIndex]['Attendance'] = status;

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
        toast?.success("Class stored successfully!");
      } else {
        console.error('No user is signed in');
        toast.error('No user is signed in');
      }
    }
  };








  const handleDeleteClass = async (classToDelete: string) => {
    if (!classToDelete || !window.confirm(`Are you sure you want to delete ${classToDelete} class?`)) {
      toast.error('There is no class in there you blind ass');
      return;
    }

    setClasses(classes => classes.filter(className => className !== classToDelete));

    setSelectedClass('');

    setClasses(classes => classes.filter(className => className !== classToDelete));


    try {
      const docRef = doc(db, `users/${authUser.uid}/classes/${classToDelete}`);
      await deleteDoc(docRef);
      toast.info("Class deleted successfull!");
    } catch (error) {
      console.error('Error delete class:', error);
      toast.error("Error deleting class");
    }
  }






  const saveData = async () => {
    if (!authUser || !authUser.uid) {
      console.error('authUser is not defined');
      toast.error('Unable to fetch your data');
      return;
    }


    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const docRef = doc(db, `users/${authUser.uid}/classes/${selectedClass}`);
      await setDoc(docRef, { tableData: fileData }, { merge: true }).catch((error) => {
        console.error('Error saving data: ', error);
        toast.error('Error saving data');
      });
      console.log('saved fileData', fileData)
      toast.success(`Data stored successfully in ${selectedClass}`);
      setTimeout(() => {
        postMessage('');
      }, 3000);

    }

  };




  async function getFirestoreTableData(userUID: string, className: string | undefined) {
    console.log('getFirestoreTableData called with userUID:', userUID, 'and className:', className);
    if (!className) {
      throw new Error('Class name is not provided');
    }
    const docRef = doc(db, 'users', userUID, 'classes', className);
    const docSnap = await getDoc(docRef);

    // console.log('Firestore document data:', docSnap.data());
    if (docSnap?.exists()) {
      return docSnap?.data()?.tableData ?? [];
    } else {
      throw new Error(`No Firestore data exists for class ${className}`);
    }
  }









  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // console.log('handleSelectChange called with event:', e);
    setSelectedClass(e.target.value);
    handleClassChange(e);
  };
  const handleClassChange = async (e: any) => {
    const newClass = e?.target?.value;
    setSelectedClass(newClass);

    if (newClass === '') {
      setFileData([]);
      setTableHeaders([]);
      return;
    }

    if (authUser && authUser.uid) {
      try {
        const firestoreData = await getFirestoreTableData(authUser.uid, newClass);
        console.log('firestoreData:', firestoreData);

        // Transform the Firestore data to match the structure expected by the table
        const transformedData = firestoreData.map((row: any) => {
          // Modify this transformation based on the structure of your Firestore data
          return row;
        });

        // Get the headers from the transformed data
        const headers = transformedData.length > 0 ? Object.keys(transformedData[0]) : [];

        // Set the transformed data and headers to update the table
        setTableHeaders(headers);
        setFileData(transformedData);
      } catch (firestoreError) {
        console.error(`Error getting Firestore table data: ${firestoreError}`);
      }
    } else {
      console.error('No user is signed in');
      setFileData([]);
      setTableHeaders([]);
    }
  };











  const fileInputRef = React.useRef(null);
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-x-auto relative">
      <div className='relative h-24 w-screen sm:w-[88vw]'>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload as unknown as ChangeEventHandler<HTMLInputElement>}
        />
        <div className='flex justify-start items-center'>
          <select className='absolute bottom-1 left-1' value={selectedClass} onChange={handleSelectChange}>
            {classes.map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))}
          </select>
          <div className=' flex'>
            <button title='add class' onClick={handleAddClass} className='absolute bottom-7 bg-gray-400 ml-1 inline-flex'><FaPlus /></button>
            <button title='delete class' onClick={() => handleDeleteClass(selectedClass)} className='absolute bottom-7  bg-gray-400 ml-6 inline-flex'><FaTimes /></button>
          </div>
        </div>
        <div className='flex justify-center items-center'>
          <button onClick={() => (fileInputRef?.current as unknown as HTMLInputElement)?.click()} className='bg-gray-400 w-fit absolute bottom-1 right-16 rounded-[5px] px-2 py-px mt-10'>Upload CSV</button>
          <button onClick={saveData} className=' bg-gray-400 w-fit px-2 py-px mt-10 right-1 bottom-1 absolute rounded-[5px]'>Save</button>
        </div>
      </div>

      <div style={{ width: '100%', maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto' }}>
        <table className="sm:w-[88vw] max-sm:w-screen table-auto border border-gray-300">
          <thead className="border border-gray-300 py-4 px-4 whitespace-nowrap">
            <tr>
              {(selectedClass !== 'Classes' && fileData?.length > 0) ? (
                <>
                  <th colSpan={2} className="h-8 px-4 w-1/4 text-center border-r border-gray-300 sticky top-0 bg-white"
                    style={{ whiteSpace: 'nowrap' }}>Attendance</th>
                  {tableHeaders?.map((header, index) => {
                    return <th key={index} className="py-2 px-4 w-1/4 text-center border-r border-gray-300 sticky top-0 bg-white"
                      style={{ whiteSpace: 'nowrap' }} rowSpan={2}>{header}</th>
                  })}
                </>
              ) : (
                <th className="border-r border-gray-300 sticky px-5 py-3 top-0 bg-white">Attendance</th>
              )}
            </tr>
            <tr>
              {(selectedClass !== 'Classes' && fileData?.length > 0) ? (
                <>
                  <th title='Present column' className='present border-t border-gray-300 border-r bg-white'>P</th>
                  <th title='Absent Column' className='absent border-r border-gray-300 border-t bg-white'>A</th>
                </>
              ) : (
                <th className="border-t border-gray-300 border-r bg-white hidden"></th>
              )}
            </tr>
          </thead>
          <tbody className="w-60 h-44">
            {selectedClass !== 'Classes' && fileData?.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200">
                <td className="py-2 text-center border-r border-gray-300 present">
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
                <td className="py-2 text-center border-r border-gray-300 absent">
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
    </div>
  );
};
export default MainScreenFileUploader;


