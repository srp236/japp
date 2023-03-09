import firebase_app from "../config";
import { getFirestore, doc, getDoc, collection, getDocs  } from "firebase/firestore";

const db = getFirestore(firebase_app)
export async function getData(colllection, id) {
  let docRef = doc(db, colllection, id);

  let result = null;
  let error = null;

  try {
      result = await getDoc(docRef);
      // console.log(result.data())
  } catch (e) {
      error = e;
  }

  return { result, error };
}

export async function getAllDocs(colllection) {
  let docList = []
  const querySnapshot = await getDocs(collection(db, colllection));
  querySnapshot.forEach((doc) => {
    docList.push(doc.id)
  });
  return docList
}