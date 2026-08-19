CREATE POLICY "cutouts_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cutouts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cutouts_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cutouts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cutouts_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cutouts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cutouts_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cutouts' AND auth.uid()::text = (storage.foldername(name))[1]);