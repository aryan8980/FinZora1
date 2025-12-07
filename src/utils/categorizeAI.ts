// AI categorization placeholder
const categoryKeywords: Record<string, string[]> = {
  Food: ['starbucks', 'restaurant', 'coffee', 'grocery', 'food', 'zomato', 'swiggy', 'mcdonalds', 'pizza'],
  Transport: ['uber', 'ola', 'metro', 'bus', 'petrol', 'fuel', 'taxi', 'rapido'],
  Entertainment: ['netflix', 'spotify', 'movie', 'cinema', 'game', 'prime', 'youtube'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'mall', 'shop', 'store'],
  Bills: ['electricity', 'water', 'internet', 'mobile', 'recharge', 'bill'],
  Health: ['hospital', 'medicine', 'doctor', 'pharmacy', 'medical'],
  Education: ['course', 'book', 'udemy', 'coursera', 'education', 'tuition'],
};

export const categorizeTransaction = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
};
