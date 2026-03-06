UPDATE stores SET is_featured = true WHERE id IN (
  SELECT id FROM stores WHERE is_active = true AND locale = 'pt' ORDER BY name LIMIT 3
);

UPDATE ngos SET is_featured = true WHERE id = 'b7478e0a-1a92-4e05-a952-76eb6c054b99';