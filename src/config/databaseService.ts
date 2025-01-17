import { databases } from "./config";

export const createDocument = async (
  data: any,
  databaseId: string,
  collectionId: string
): Promise<any> => {
  try {
    const response = await databases.createDocument(
      databaseId,
      collectionId,
      "unique()", // Auto-generate a unique ID
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const getDocument = async (
  documentId: string,
  databaseId: string,
  collectionId: string
): Promise<any> => {
  try {
    const response = await databases.getDocument(
      databaseId,
      collectionId,
      documentId
    );
    return response;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const listDocuments = async (
  queries: string[] = [],
  databaseId: string,
  collectionId: string
): Promise<any[]> => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      queries
    );
    return response.documents;
  } catch (error) {
    console.error("Error listing documents:", error);
    throw error;
  }
};

export const updateDocument = async (
  documentId: string,
  data: any,
  databaseId: string,
  collectionId: string
): Promise<any> => {
  try {
    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );
    return response;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (
  documentId: string,
  databaseId: string,
  collectionId: string
): Promise<void> => {
  try {
    await databases.deleteDocument(databaseId, collectionId, documentId);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
