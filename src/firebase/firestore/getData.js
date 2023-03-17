import firebase_app from "../config";
import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot, query, where  } from "firebase/firestore";

const db = getFirestore(firebase_app)
export async function getData(colllection, id) {
  let docRef = doc(db, colllection, id);

  let result = null;
  let error = null;

  try {
      result = await getDoc(docRef);
  } catch (e) {
      error = e;
  }

  return { result, error };
}

export async function getAllDocs(colllection) {
  let docList = []
  const querySnapshot = await getDocs(collection(db, colllection));
  querySnapshot.forEach((doc) => {
    docList.push({id:doc.id, data:Object.keys(doc.data())})
  });
  return docList
}

export function docsQuery(colllection){
  let test = []
  const q = query(collection(db, colllection))
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      test.push({id:doc.id, data:Object.keys(doc.data())});
    })
  })
  console.log(test)
  return test
}
// export async function docsQuery(colllection, id){
//   const unsub = onSnapshot(doc(db, colllection, id), (doc => {
//     console.log("Current data: ", doc.data())
//   }))
// }