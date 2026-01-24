-- Cleanup Duplicate Messages
-- This script removes duplicate messages from project_messages table
-- Keeps only the oldest message for each unique combination of project_id, content, and role

-- Delete duplicate messages (keeps the first one based on created_at)
DELETE FROM project_messages
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY project_id, content, role 
             ORDER BY created_at ASC
           ) AS rnum
    FROM project_messages
  ) t
  WHERE t.rnum > 1
);

-- Show how many messages remain after cleanup
SELECT 
  project_id,
  COUNT(*) as message_count,
  COUNT(DISTINCT content) as unique_messages
FROM project_messages
GROUP BY project_id
ORDER BY project_id;
