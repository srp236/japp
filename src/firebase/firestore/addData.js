import firebase_app from "../config";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";

const db = getFirestore(firebase_app)
export async function addData(colllection, id, data) {
    let result = null;
    let error = null;

    try {
        result = await setDoc(doc(db, colllection, id), data, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    return { result, error };
}

export async function createDoc(colllection, id, data) {
    const response = await setDoc(doc(db, colllection, id), data,{merge: true})
    return response
}