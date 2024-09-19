import Papa from "papaparse";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseconfig";

const CoordinatorDashBoard: React.FC = () => {
  const [authUser, setAuthUser] = useState<typeof user | null>(null);

  const [, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Array<{ [key: string]: string }>>(
    []
  );
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([""]);
  const [selectedClass, setSelectedClass] = useState<string>("");

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
        const classList: { id: string; name: string }[] = [];
        classSnapshot.forEach((doc) => {
          classList.push({ id: doc.id, name: doc.id });
        });

        setClasses(classList.map((item) => item.name));

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

    if (
      rows &&
      rows.length > 0 &&
      Object.values(rows[rows.length - 1]).every((value) => !value)
    ) {
      rows = rows.slice(0, -1);
    }
    const updatedHeaders = [...(headers || [])];
    setTableHeaders(updatedHeaders);

    setFileData(rows);
  };

  //Uploads the file in firebase storage

  function handleFileUpload(event: { target: { files: FileList } }) {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e?.target?.result as string;
        parseAndDisplayData(content);
      };

      reader?.readAsText(event.target.files[0]);
      reader.onerror = function (error) {
        console.error("Error reading file: ", error);
        toast.error("Error reading file");
      };
    }
  }

  const handleAttendanceChange = (
    rowIndex: number,
    status: "Present" | "Absent"
  ) => {
    const newFileData = [...fileData];

    newFileData[rowIndex]["Attendance"] = status;

    setFileData(newFileData);
  };

  const handleAddClass = async () => {
    const newClass = prompt("Enter The New Class....Eg.:9th-A or 9th_A");
    if (newClass) {
      setClasses((prevClasses) => [...prevClasses, newClass]);
      if (authUser && authUser.uid) {
        const docRef = doc(db, `users/${authUser.uid}/classes/${newClass}`);
        await setDoc(docRef, {}).catch((error) => {
          console.error("Error adding class: ", error);
          toast.error("Error adding class");
        });
        toast?.success("Class stored successfully!");
      } else {
        console.error("No user is signed in");
        toast.error("No user is signed in");
      }
    }
  };

  const handleDeleteClass = async (classToDelete: string) => {
    if (classToDelete === "Classes") {
      toast.error("Cannot delete the default class 'Classes'");
      return;
    }

    if (!classToDelete) {
      toast.error("Select class to delete");
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete ${classToDelete} class?`)
    ) {
      return;
    }

    setClasses((classes) =>
      classes.filter((className) => className !== classToDelete)
    );

    setSelectedClass("");

    try {
      const docRef = doc(db, `users/${authUser.uid}/classes/${classToDelete}`);
      await deleteDoc(docRef);

      const classesRef = collection(db, `users/${authUser.uid}/classes`);
      const classesSnapshot = await getDocs(classesRef);
      const remainingClasses = classesSnapshot.docs.map((doc) => doc.id);

      if (remainingClasses.length === 0) {
        setFileData([]);
        setTableHeaders([]);
      }

      toast.info("Class deleted successfully!");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Error deleting class");
    }
  };

  const saveData = async () => {
    if (!authUser || !authUser.uid) {
      console.error("authUser is not defined");
      toast.error("Unable to fetch your data");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const docRef = doc(db, `users/${authUser.uid}/classes/${selectedClass}`);
      await setDoc(docRef, { tableData: fileData }, { merge: true }).catch(
        (error) => {
          console.error("Error saving data: ", error);
          toast.error("Error saving data");
        }
      );
      toast.success(`Data stored successfully in ${selectedClass}`);
      setTimeout(() => {
        postMessage("");
      }, 3000);
    }
  };

  async function getFirestoreTableData(
    userUID: string,
    className: string | undefined
  ) {
    if (!className) {
      throw new Error("Class name is not provided");
    }
    const docRef = doc(db, "users", userUID, "classes", className);
    const docSnap = await getDoc(docRef);

    if (docSnap?.exists()) {
      return docSnap?.data()?.tableData ?? [];
    } else {
      throw new Error(`No Firestore data exists for class ${className}`);
    }
  }

  const handleSelectChange = (value: string) => {
    setSelectedClass(value);
    handleClassChange(value);
  };
  const handleClassChange = async (values: any) => {
    const newClass = values?.target?.value || values; // Handle both event object and direct value
    console.log("Selected class:", newClass); // Debugging log

    if (!newClass || newClass === "Classes") {
      setSelectedClass("");
      setFileData([]);
      setTableHeaders([]);
      return;
    }

    setSelectedClass(newClass);

    if (authUser && authUser.uid) {
      try {
        const firestoreData = await getFirestoreTableData(
          authUser.uid,
          newClass
        );

        // Transform the Firestore data to match the structure expected by the table
        const transformedData = firestoreData.map((row: any) => {
          // Modify this transformation based on the structure of your Firestore data
          return row;
        });

        // Get the headers from the transformed data
        const headers =
          transformedData.length > 0 ? Object.keys(transformedData[0]) : [];

        // Set the transformed data and headers to update the table
        setTableHeaders(headers);
        setFileData(transformedData);
      } catch (firestoreError) {
        console.error(`Error getting Firestore table data: ${firestoreError}`);
      }
    } else {
      console.error("No user is signed in");
      setFileData([]);
      setTableHeaders([]);
    }
  };

  const fileInputRef = React.useRef(null);
  return (
    <div className="flex flex-col h-[100vh] overflow-x-auto relative">
      {/* table's above part */}
      <div className="relative mt-4 h-[96px] w-screen sm:w-[87vw]">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={
            handleFileUpload as unknown as ChangeEventHandler<HTMLInputElement>
          }
        />
        <Select onValueChange={handleSelectChange}>
          <div className="w-36 absolute bottom-1 flex items-center left-1">
            <button
              title="add class"
              onClick={handleAddClass}
              className="z-10 absolute right-1">
              <FaPlus />
            </button>
            <SelectTrigger className="flex pr-7 pl-2 items-center relative">
              <SelectValue placeholder="Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {classes.map((className, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group flex flex-row items-center">
                    <SelectItem value={className || "i"}>
                      {className}
                    </SelectItem>
                    <button
                      className="absolute right-1 cursor-pointer hidden group-hover:block"
                      onClick={() => handleDeleteClass(className)}>
                      <FaTimes className="text-red-500 bg-gray-100 hover:bg-white" />
                    </button>
                  </div>
                ))}
              </SelectGroup>
            </SelectContent>
          </div>
        </Select>
        <div className="flex justify-center items-center">
          <Button
            variant="outline"
            onClick={() =>
              (fileInputRef?.current as unknown as HTMLInputElement)?.click()
            }
            className="bg-transparent border shadow-md w-fit absolute bottom-1 right-16 rounded-[3px] px-2 py-px mt-10 max-sm:px-1 max-sm:text-sm max-sm:right-12">
            Upload CSV
          </Button>
          <Button
            variant="outline"
            onClick={saveData}
            className=" bg-transparent border shadow-md w-fit px-2 py-px mt-10 right-1 bottom-1 absolute rounded-[3px] max-sm:px-1 max-sm:text-sm ">
            Save
          </Button>
        </div>
      </div>
      {/* table's above part ends here */}

      <div style={{ width: "100%", height: "100vh", overflowY: "scroll" }}>
        <table className="relative sm:w-[88vw] max-sm:w-screen table-auto bg-white">
          <thead className="py-4 px-4 whitespace-pre-wrap sticky top-0 bg-white z-10">
            <tr>
              {selectedClass !== "Classes" && fileData?.length > 0 ? (
                <>
                  <th
                    colSpan={2}
                    className="h-8 px-4 w-1/4 text-center border bg-white"
                    style={{ whiteSpace: "nowrap" }}>
                    Attendance
                  </th>
                  {tableHeaders?.map((header, index) => {
                    return (
                      <th
                        key={index}
                        className="py-2 px-4 w-1/4 text-center bg-white border"
                        style={{ whiteSpace: "nowrap" }}
                        rowSpan={2}>
                        {header}
                      </th>
                    );
                  })}
                </>
              ) : (
                <div className="flex flex-col h-[86vh] w-screen sm:w-[87vw]">
                  <th className="sticky px-5 py-3 top-0 bg-white border">
                    Attendance
                  </th>
                  <h1 className="h-full w-full flex justify-center items-center text-lg font-mono">
                    Ops's no data
                  </h1>
                </div>
              )}
            </tr>
            <tr>
              {selectedClass !== "Classes" && fileData?.length > 0 ? (
                <>
                  <th
                    title="Present column"
                    className="present bg-white border">
                    P
                  </th>
                  <th title="Absent Column" className="absent bg-white border">
                    A
                  </th>
                </>
              ) : (
                <th className="bg-white hidden"></th>
              )}
            </tr>
          </thead>
          <tbody className="w-60 h-44">
            {selectedClass !== "Classes" &&
              fileData?.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  <td className="py-2 text-center border-r border-gray-300 present">
                    {fileData.length > 0 && (
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name={`attendance-${rowIndex}`}
                          checked={row["Attendance"] === "Present"}
                          title="Present"
                          onChange={() =>
                            handleAttendanceChange(rowIndex, "Present")
                          }
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-2 text-center border-r border-gray-300 absent">
                    {fileData.length > 0 && (
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name={`attendance-${rowIndex}`}
                          checked={row["Attendance"] === "Absent"}
                          title="Absent"
                          onChange={() =>
                            handleAttendanceChange(rowIndex, "Absent")
                          }
                        />
                      </div>
                    )}
                  </td>
                  {tableHeaders?.map(
                    (
                      header: string,
                      cellIndex: React.Key | null | undefined
                    ) => (
                      <td
                        className="py-2 px-4 w-1/4 text-center border-r border-gray-300"
                        key={cellIndex}>
                        {row[header]}
                      </td>
                    )
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CoordinatorDashBoard;
