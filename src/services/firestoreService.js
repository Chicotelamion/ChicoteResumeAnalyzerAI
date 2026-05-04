import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';

const LOCAL_KEYS = {
  resumeProfiles: 'careerpath_resume_profiles',
  aiAnalysis: 'careerpath_ai_analysis',
  users: 'careerpath_users'
};

function withTimeout(promise, action, timeoutMs = 5000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${action} timed out. Check that Cloud Firestore is created, your internet connection is working, and Firestore rules allow this user.`
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function readLocalCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeLocalCollection(key, records) {
  localStorage.setItem(key, JSON.stringify(records));
}

function saveLocalRecord(key, record) {
  const records = readLocalCollection(key);
  const savedRecord = {
    id: `local-${Date.now()}`,
    ...record
  };
  writeLocalCollection(key, [savedRecord, ...records]);
  return savedRecord;
}

function getLocalRecordsByUser(key, userId) {
  return readLocalCollection(key).filter((record) => record.userId === userId || record.uid === userId);
}

function getTimeValue(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Date(value).getTime() || 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  return 0;
}

function sortNewestFirst(records, fieldName) {
  // Client-side sorting avoids composite index setup for classroom/demo projects.
  return [...records].sort((a, b) => {
    const aTime = getTimeValue(a[fieldName]);
    const bTime = getTimeValue(b[fieldName]);
    return bTime - aTime;
  });
}

export async function createUserDocument({ uid, fullname, email }) {
  const userRecord = {
    uid,
    fullname,
    email,
    createdAt: new Date().toISOString()
  };

  try {
    await withTimeout(
      setDoc(doc(db, 'users', uid), {
        uid,
        fullname,
        email,
        createdAt: serverTimestamp()
      }),
      'Creating user record'
    );
  } catch (error) {
    console.warn('Firestore user save failed, using local fallback.', error);
    saveLocalRecord(LOCAL_KEYS.users, userRecord);
  }
}

export async function saveResumeProfile(userId, profile) {
  const localProfile = {
    userId,
    ...profile,
    createdAt: new Date().toISOString()
  };
  const savedLocalProfile = saveLocalRecord(LOCAL_KEYS.resumeProfiles, localProfile);

  withTimeout(
    addDoc(collection(db, 'resume_profiles'), {
        userId,
        ...profile,
        createdAt: serverTimestamp()
      }),
      'Saving resume profile'
    ).catch((error) => {
      console.warn('Firestore resume sync failed, local profile already saved.', error);
    });

  return savedLocalProfile.id;
}

export async function getLatestResumeProfile(userId) {
  try {
    const q = query(collection(db, 'resume_profiles'), where('userId', '==', userId));
    const snapshot = await withTimeout(getDocs(q), 'Loading latest resume profile');

    if (snapshot.empty) {
      const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
      return sortNewestFirst(localRecords, 'createdAt')[0] || null;
    }

    const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return sortNewestFirst(records, 'createdAt')[0];
  } catch (error) {
    console.warn('Firestore resume load failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
    return sortNewestFirst(localRecords, 'createdAt')[0] || null;
  }
}

export async function getResumeProfiles(userId) {
  try {
    const q = query(collection(db, 'resume_profiles'), where('userId', '==', userId));
    const snapshot = await withTimeout(getDocs(q), 'Loading resume profiles');
    const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return sortNewestFirst(records, 'createdAt');
  } catch (error) {
    console.warn('Firestore resume list failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
    return sortNewestFirst(localRecords, 'createdAt');
  }
}

export async function saveAIAnalysis(userId, analysis) {
  const localAnalysis = {
    userId,
    ...analysis,
    analyzedAt: new Date().toISOString()
  };
  const savedLocalAnalysis = saveLocalRecord(LOCAL_KEYS.aiAnalysis, localAnalysis);

  withTimeout(
    addDoc(collection(db, 'ai_analysis'), {
        userId,
        ...analysis,
        analyzedAt: serverTimestamp()
      }),
      'Saving AI analysis'
    ).catch((error) => {
      console.warn('Firestore analysis sync failed, local analysis already saved.', error);
    });

  return savedLocalAnalysis.id;
}

export async function getAIAnalysisHistory(userId) {
  try {
    const q = query(collection(db, 'ai_analysis'), where('userId', '==', userId));
    const snapshot = await withTimeout(getDocs(q), 'Loading AI analysis history');
    const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return sortNewestFirst(records, 'analyzedAt');
  } catch (error) {
    console.warn('Firestore analysis history failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.aiAnalysis, userId);
    return sortNewestFirst(localRecords, 'analyzedAt');
  }
}

/*
  Legacy Firebase-only implementations were replaced with Firebase-first,
  local-fallback functions above so the academic demo remains usable even when
  Cloud Firestore is not enabled, blocked by rules, or unreachable on campus Wi-Fi.
*/
/*
export async function createUserDocument({ uid, fullname, email }) {
  await withTimeout(
    setDoc(doc(db, 'users', uid), {
      uid,
      fullname,
      email,
      createdAt: serverTimestamp()
    }),
    'Creating user record'
  );
}

export async function saveResumeProfile(userId, profile) {
  const docRef = await withTimeout(
    addDoc(collection(db, 'resume_profiles'), {
      userId,
      ...profile,
      createdAt: serverTimestamp()
    }),
    'Saving resume profile'
  );

  return docRef.id;
}

export async function getLatestResumeProfile(userId) {
  const q = query(collection(db, 'resume_profiles'), where('userId', '==', userId));
  const snapshot = await withTimeout(getDocs(q), 'Loading latest resume profile');

  if (snapshot.empty) return null;
  const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  return sortNewestFirst(records, 'createdAt')[0];
}

export async function getResumeProfiles(userId) {
  const q = query(collection(db, 'resume_profiles'), where('userId', '==', userId));
  const snapshot = await withTimeout(getDocs(q), 'Loading resume profiles');
  const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  return sortNewestFirst(records, 'createdAt');
}

export async function saveAIAnalysis(userId, analysis) {
  const docRef = await withTimeout(
    addDoc(collection(db, 'ai_analysis'), {
      userId,
      ...analysis,
      analyzedAt: serverTimestamp()
    }),
    'Saving AI analysis'
  );

  return docRef.id;
}

export async function getAIAnalysisHistory(userId) {
  const q = query(collection(db, 'ai_analysis'), where('userId', '==', userId));
  const snapshot = await withTimeout(getDocs(q), 'Loading AI analysis history');
  const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  return sortNewestFirst(records, 'analyzedAt');
}
*/
