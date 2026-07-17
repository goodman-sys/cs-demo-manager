import { useSelector } from 'csdm/ui/store/use-selector';

export function useLocale() {
  const settings = useSelector((state) => state.settings);

  return settings?.ui?.locale ?? 'en';
}
