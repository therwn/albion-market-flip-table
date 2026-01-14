/**
 * Tier renklendirmesi için utility fonksiyonlar
 * Her tier için soft, pastel renkler
 */

export function getTierBackgroundColor(tier: string): string {
  if (!tier) return '';
  
  const tierNumber = parseInt(tier.split('.')[0]);
  
  switch (tierNumber) {
    case 4:
      // Soft mavi tonları
      return 'bg-blue-50/50 dark:bg-blue-950/30 border-l-4 border-blue-300 dark:border-blue-700';
    case 5:
      // Soft yeşil tonları
      return 'bg-green-50/50 dark:bg-green-950/30 border-l-4 border-green-300 dark:border-green-700';
    case 6:
      // Soft sarı/turuncu tonları
      return 'bg-yellow-50/50 dark:bg-yellow-950/30 border-l-4 border-yellow-300 dark:border-yellow-700';
    case 7:
      // Soft mor tonları
      return 'bg-purple-50/50 dark:bg-purple-950/30 border-l-4 border-purple-300 dark:border-purple-700';
    case 8:
      // Soft kırmızı/pembe tonları
      return 'bg-pink-50/50 dark:bg-pink-950/30 border-l-4 border-pink-300 dark:border-pink-700';
    default:
      // Varsayılan gri tonları
      return 'bg-gray-50/50 dark:bg-gray-950/30 border-l-4 border-gray-300 dark:border-gray-700';
  }
}

export function getTierTextColor(tier: string): string {
  const tierNumber = parseInt(tier.split('.')[0]);
  
  switch (tierNumber) {
    case 4:
      return 'text-blue-700 dark:text-blue-300';
    case 5:
      return 'text-green-700 dark:text-green-300';
    case 6:
      return 'text-yellow-700 dark:text-yellow-300';
    case 7:
      return 'text-purple-700 dark:text-purple-300';
    case 8:
      return 'text-pink-700 dark:text-pink-300';
    default:
      return '';
  }
}
