ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS locations text[] DEFAULT ARRAY['geral'];

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS locations text[] DEFAULT ARRAY['galeria'];

UPDATE public.videos
SET locations = ARRAY(
  SELECT DISTINCT unnest(
    ARRAY_REMOVE(
      ARRAY[COALESCE(category, 'geral'), CASE WHEN is_featured THEN 'home' ELSE NULL END],
      NULL
    )
  )
)
WHERE locations IS NULL OR array_length(locations, 1) IS NULL;

UPDATE public.photos
SET locations = ARRAY(
  SELECT DISTINCT unnest(
    ARRAY_REMOVE(
      ARRAY[COALESCE(category, 'galeria'), CASE WHEN is_featured THEN 'home' ELSE NULL END],
      NULL
    )
  )
)
WHERE locations IS NULL OR array_length(locations, 1) IS NULL;