import { useState, useCallback } from "react";
import { databases } from "./config"; // Ensure your Appwrite config is set up correctly
import { Query } from "appwrite";
import { DateTime } from "luxon";

export const useDatabase = (databaseId: string, collectionId: string) => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const fetchAllRecordsByMonth = useCallback(
    async ({ yearMonth }: { yearMonth: string }) => {
      setLoading(true);
      setError(null);

      try {
        // Parse the yearMonth string and calculate the start and end of the month
        const startOfMonth = DateTime.fromFormat(yearMonth, "yyyy-MM")
          .startOf("month")
          .toISO();
        const endOfMonth = DateTime.fromFormat(yearMonth, "yyyy-MM")
          .endOf("month")
          .toISO();
        // Ensure that startOfMonth and endOfMonth are valid
        if (!startOfMonth || !endOfMonth) {
          throw new Error("Invalid date range generated from yearMonth input.");
        }
        let allDocuments: any[] = [];
        let offset = 0;
        const limit = 100; // Appwrite's max limit per request

        while (true) {
          // Fetch a batch of documents within the date range
          const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [
              Query.greaterThanEqual("$createdAt", startOfMonth),
              Query.lessThanEqual("$createdAt", endOfMonth),
              Query.limit(limit),
              Query.offset(offset),
              Query.orderDesc("$createdAt"),
            ]
          );

          // Append the documents to the result array
          allDocuments = [...allDocuments, ...response.documents];

          // Break the loop when all documents have been fetched
          if (allDocuments.length >= response.total) {
            break;
          }

          // Increment the offset for the next batch
          offset += limit;
        }

        // Save the fetched documents and total count
        setList(allDocuments);
        setTotal(allDocuments.length);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [databaseId, collectionId]
  );

  const fetchAllWithFilters = useCallback(
    async ({ filters = [] }: { filters?: any[] }) => {
      setLoading(true);
      setError(null);

      try {
        let allDocuments: any[] = [];
        let offset = 0;
        const limit = 100; // Maximum limit per Appwrite request

        while (true) {
          // Fetch a batch of documents
          const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [
              Query.limit(limit),
              Query.offset(offset),
              ...filters, // Spread additional filters
            ]
          );

          // Append the fetched documents to the list
          allDocuments = [...allDocuments, ...response.documents];

          // Break the loop if we've retrieved all documents
          if (allDocuments.length >= response.total) {
            break;
          }

          // Increment the offset for the next batch
          offset += limit;
        }

        // Save the entire list and total to state
        setList(allDocuments);
        setTotal(allDocuments.length);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [databaseId, collectionId]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    let allDocuments: any[] = [];
    const limit = 100; // Maximum records Appwrite allows per request
    let offset = 0;
    let total = 0; // To track the total number of records

    try {
      do {
        // Fetch documents with the current offset and limit
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.limit(limit), Query.offset(offset)]
        );

        // Append the fetched documents to the main list
        allDocuments = [...allDocuments, ...response.documents];

        // Set the total number of records (available from the first response)
        total = response.total;
        setTotal(response.total);
        // Update the offset for the next batch
        offset += limit;
      } while (allDocuments.length < total); // Stop when all documents are fetched

      setList(allDocuments);
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
    fetchAllWithFilters,
    fetchAllRecordsByMonth,
    fetchAll,
    total,
    create,
    update,
    remove,
    loading,
    error,
  };
};
