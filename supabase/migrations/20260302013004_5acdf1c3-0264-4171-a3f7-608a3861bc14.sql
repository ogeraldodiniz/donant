
ALTER TABLE public.profiles
DROP CONSTRAINT fk_selected_ngo;

ALTER TABLE public.profiles
ADD CONSTRAINT fk_selected_ngo
FOREIGN KEY (selected_ngo_id) REFERENCES public.ngos(id)
ON DELETE SET NULL;
