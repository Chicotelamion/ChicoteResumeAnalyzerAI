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

function getUserDoc(uid) {
  return doc(db, 'users', uid);
}

function getUserResumeProfilesCollection(uid) {
  return collection(getUserDoc(uid), 'resume_profiles');
}

function getUserAIAnalysisCollection(uid) {
  return collection(getUserDoc(uid), 'ai_analysis');
}

async function getUserSubcollectionRecords(uid, collectionName, action) {
  const snapshot = await withTimeout(
    getDocs(collection(getUserDoc(uid), collectionName)),
    action
  );

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function getLegacyRecords(collectionName, userId, action) {
  const q = query(collection(db, collectionName), where('userId', '==', userId));
  const snapshot = await withTimeout(getDocs(q), action);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
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
      setDoc(getUserDoc(uid), {
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
  try {
    const createdAt = new Date().toISOString();
    const docRef = await withTimeout(
      addDoc(getUserResumeProfilesCollection(userId), {
        userId,
        ...profile,
        createdAt: serverTimestamp()
      }),
      'Saving discovery profile'
    );

    saveLocalRecord(LOCAL_KEYS.resumeProfiles, {
      userId,
      ...profile,
      createdAt
    });

    return docRef.id;
  } catch (error) {
    console.warn('Firestore discovery profile save failed.', error);
    throw error;
  }
}

export async function getLatestResumeProfile(userId) {
  try {
    let records = await getUserSubcollectionRecords(
      userId,
      'resume_profiles',
      'Loading latest discovery profile'
    );

    if (records.length === 0) {
      records = await getLegacyRecords(
        'resume_profiles',
        userId,
        'Loading latest discovery profile from legacy records'
      );
    }

    if (records.length === 0) {
      const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
      return sortNewestFirst(localRecords, 'createdAt')[0] || null;
    }

    return sortNewestFirst(records, 'createdAt')[0];
  } catch (error) {
    console.warn('Firestore discovery profile load failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
    return sortNewestFirst(localRecords, 'createdAt')[0] || null;
  }
}

export async function getResumeProfiles(userId) {
  try {
    let records = await getUserSubcollectionRecords(
      userId,
      'resume_profiles',
      'Loading discovery profiles'
    );

    if (records.length === 0) {
      records = await getLegacyRecords(
        'resume_profiles',
        userId,
        'Loading discovery profiles from legacy records'
      );
    }

    return sortNewestFirst(records, 'createdAt');
  } catch (error) {
    console.warn('Firestore discovery profile list failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.resumeProfiles, userId);
    return sortNewestFirst(localRecords, 'createdAt');
  }
}

export async function saveAIAnalysis(userId, analysis) {
  try {
    const analyzedAt = new Date().toISOString();
    const docRef = await withTimeout(
      addDoc(getUserAIAnalysisCollection(userId), {
        userId,
        ...analysis,
        analyzedAt: serverTimestamp()
      }),
      'Saving AI analysis'
    );

    saveLocalRecord(LOCAL_KEYS.aiAnalysis, {
      userId,
      ...analysis,
      analyzedAt
    });

    return docRef.id;
  } catch (error) {
    console.warn('Firestore analysis save failed.', error);
    throw error;
  }
}

export async function getAIAnalysisHistory(userId) {
  try {
    let records = await getUserSubcollectionRecords(
      userId,
      'ai_analysis',
      'Loading AI analysis history'
    );

    if (records.length === 0) {
      records = await getLegacyRecords(
        'ai_analysis',
        userId,
        'Loading AI analysis history from legacy records'
      );
    }

    return sortNewestFirst(records, 'analyzedAt');
  } catch (error) {
    console.warn('Firestore analysis history failed, using local fallback.', error);
    const localRecords = getLocalRecordsByUser(LOCAL_KEYS.aiAnalysis, userId);
    return sortNewestFirst(localRecords, 'analyzedAt');
  }
}
