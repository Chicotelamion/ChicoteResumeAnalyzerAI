import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.js';

function withTimeout(promise, action, timeoutMs = 12000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${action} timed out. The profile can still be saved without the optional resume file.`
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export async function uploadResumeFile(userId, file) {
  if (!file) return '';

  const filePath = `resumes/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  await withTimeout(uploadBytes(storageRef, file), 'Uploading resume file');
  return withTimeout(getDownloadURL(storageRef), 'Getting resume file URL');
}
