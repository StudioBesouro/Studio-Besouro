import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAdminData = () => {
  const [banners, setBanners] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [stats, setStats] = useState({ 
    banners: 0, 
    artistas: 0, 
    obras: 0,
    totalBanners: 0, 
    totalArtistas: 0, 
    totalObras: 0 
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Executa as 3 consultas no Supabase em paralelo para maior performance
      const [{ data: b }, { data: a }, { count: oCount }] = await Promise.all([
        supabase.from('banner').select('*').order('created_at', { ascending: false }),
        supabase.from('perfil_artista').select('*, obras(count)').order('nome'),
        supabase.from('obras').select('*', { count: 'exact', head: true }),
      ]);

      const bannersData = b || [];
      const artistasData = a || [];
      const obrasCount = oCount || 0;

      setBanners(bannersData);
      setArtistas(artistasData);

      // Mapeia chaves antigas e novas para evitar quebra de contrato de componentes
      setStats({
        banners: bannersData.length,
        artistas: artistasData.length,
        obras: obrasCount,
        totalBanners: bannersData.length,
        totalArtistas: artistasData.length,
        totalObras: obrasCount
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload garantindo a correta detecção do Content-Type (Vídeos/PDFs/Imagens)
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });
      
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  return { 
    banners, 
    artistas, 
    stats, 
    loading, 
    setLoading, 
    fetchData, 
    uploadFile 
  };
};