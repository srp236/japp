import firebase_app from "../config";
import { getFirestore, doc, setDoc, updateDoc, deleteField } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function delField(colllection, id, data) {
    let result = null;
    let error = null;

    try {
        const ref = doc(db, colllection, id)
        result = await updateDoc(ref, {[data]: deleteField()});
    } catch (e) {
        error = e;
    }

    return { result, error };
}