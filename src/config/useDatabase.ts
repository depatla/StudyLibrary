import { useState, useCallback } from "react";
import { databases } from "./config"; // Ensure your Appwrite config is set up correctly

export const useDatabase = (databaseId: string, collectionId: string) => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all documents
  const fetchAll = useCallback(async () => {
    console.log("calling api");
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(databaseId, collectionId);
      setList(response.documents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [databaseId, collectionId]);

  // Create a document
  const create = useCallback(
    async (document: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await databases.createDocument(
          databaseId,
          collectionId,
          "unique()",
          document
        );
        setList((prev) => [...prev, response]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [databaseId, collectionId]
  );

  // Update a document
  const update = useCallback(
    async (id: string, document: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await databases.updateDocument(
          databaseId,
          collectionId,
          id,
          document
        );
        setList((prev) =>
          prev.map((item) => (item.$id === id ? response : item))
        );
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [databaseId, collectionId]
  );

  // Delete a document
  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await databases.deleteDocument(databaseId, collectionId, id);
        setList((prev) => prev.filter((item) => item.$id !== id));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [databaseId, collectionId]
  );

  return {
    list,
    fetchAll,
    create,
    update,
    remove,
    loading,
    error,
  };
};
