import { supabase } from '@/integrations/supabase/client';

export interface CompanyLogo {
  symbol: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export const fetchAndStoreLogos = async (symbols: string[]): Promise<CompanyLogo[]> => {
  console.log('LogoService: Starting fetch and store for symbols:', symbols);
  
  try {
    // First, check which logos we already have in the database
    const { data: existingLogos, error: fetchError } = await supabase
      .from('company_logos')
      .select('*')
      .in('symbol', symbols);

    if (fetchError) {
      console.error('LogoService: Error fetching existing logos:', fetchError);
      throw fetchError;
    }

    console.log('LogoService: Found existing logos:', existingLogos);

    // Determine which symbols need to be fetched
    const existingSymbols = existingLogos?.map(logo => logo.symbol) || [];
    const symbolsToFetch = symbols.filter(symbol => !existingSymbols.includes(symbol));

    console.log('LogoService: Symbols to fetch:', symbolsToFetch);

    // If all logos exist, return them
    if (symbolsToFetch.length === 0) {
      return existingLogos || [];
    }

    // Fetch new logos from Finnhub
    const { data: fetchedLogos, error: fetchLogosError } = await supabase.functions.invoke(
      'fetch-company-logos',
      {
        body: { symbols: symbolsToFetch }
      }
    );

    if (fetchLogosError) {
      console.error('LogoService: Error fetching logos from Finnhub:', fetchLogosError);
      throw fetchLogosError;
    }

    console.log('LogoService: Fetched logos from Finnhub:', fetchedLogos);

    // Store new logos in the database
    if (fetchedLogos?.logos && fetchedLogos.logos.length > 0) {
      const { data: insertedLogos, error: insertError } = await supabase
        .from('company_logos')
        .insert(fetchedLogos.logos)
        .select('*');

      if (insertError) {
        console.error('LogoService: Error inserting logos:', insertError);
        throw insertError;
      }

      console.log('LogoService: Inserted logos:', insertedLogos);

      // Return combined results
      return [...(existingLogos || []), ...(insertedLogos || [])];
    }

    // Return existing logos if no new ones were fetched
    return existingLogos || [];

  } catch (error) {
    console.error('LogoService: Error in fetchAndStoreLogos:', error);
    throw error;
  }
};

export const getLogoUrl = async (symbol: string): Promise<string | null> => {
  console.log('LogoService: Getting logo URL for symbol:', symbol);
  
  try {
    const { data: logo, error } = await supabase
      .from('company_logos')
      .select('logo_url')
      .eq('symbol', symbol)
      .single();

    if (error) {
      console.error('LogoService: Error fetching logo URL:', error);
      return null;
    }

    console.log('LogoService: Found logo URL:', logo?.logo_url);
    return logo?.logo_url || null;

  } catch (error) {
    console.error('LogoService: Error in getLogoUrl:', error);
    return null;
  }
};