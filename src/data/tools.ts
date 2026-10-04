// Registry of every tool. Add a new tool here first, then follow the checklist in PROJECT.md.
export type Category = 'exam-documents' | 'calculators' | 'classroom';

export const CATEGORIES: Record<Category, { name: string; blurb: string }> = {
  'exam-documents': {
    name: 'Photos and PDFs for forms',
    blurb: 'Resize, compress and convert the files that online application forms ask for.',
  },
  calculators: {
    name: 'Calculators and converters',
    blurb: 'Percentages, grades, CGPA and age checks, with the working shown.',
  },
  classroom: {
    name: 'Classroom tools',
    blurb: 'Quick helpers for teachers running a class or an exam hall.',
  },
};

export interface Tool {
  slug: string;
  name: string; // short name used in cards and nav
  title: string; // <title>, under 60 characters
  h1: string;
  primaryPhrase: string;
  blurb: string; // one line for cards
  description: string; // meta description, 120-160 characters
  category: Category;
  guide: string; // slug of the matching guide
  related: string[]; // tool slugs
  lastUpdated: string; // ISO date
  applicationCategory: string;
}

export const TOOLS: Tool[] = [
  {
    slug: 'photo-and-signature-resizer',
    blurb: 'Set exact pixels and a size in KB for form photos and signatures, with live preview.',
    name: 'Photo and signature resizer',
    title: 'Photo and Signature Resizer to KB and Pixels',
    h1: 'Photo and Signature Resizer',
    primaryPhrase: 'photo and signature resizer',
    description:
      'Free photo and signature resizer. Set the exact width, height and target size in KB, preview the result and download a JPEG. Works offline in your browser.',
    category: 'exam-documents',
    guide: 'how-to-reduce-photo-size-in-kb',
    related: ['image-to-pdf', 'compress-pdf-to-specific-size', 'pdf-to-image'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'MultimediaApplication',
  },
  {
    slug: 'compress-pdf-to-specific-size',
    blurb: 'Shrink a PDF until it fits the size limit on an upload form.',
    name: 'Compress PDF to a target size',
    title: 'Compress PDF to a Specific Size in KB or MB',
    h1: 'Compress PDF to a Specific Size',
    primaryPhrase: 'compress pdf to specific size',
    description:
      'Compress a PDF to a specific size in KB or MB. The file stays on your device: pages are re-rendered in your browser until the target is reached.',
    category: 'exam-documents',
    guide: 'how-to-make-a-pdf-smaller-for-upload',
    related: ['image-to-pdf', 'pdf-to-image', 'photo-and-signature-resizer'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'UtilitiesApplication',
  },
  {
    slug: 'image-to-pdf',
    blurb: 'Combine JPG and PNG images into one PDF, in the order you choose.',
    name: 'Image to PDF',
    title: 'Image to PDF Converter: Combine Photos into One PDF',
    h1: 'Image to PDF Converter',
    primaryPhrase: 'image to pdf converter',
    description:
      'Turn JPG and PNG images into one PDF. Reorder pages, pick A4 or fit-to-image size and download. Nothing is uploaded; it all runs in your browser.',
    category: 'exam-documents',
    guide: 'how-to-combine-photos-into-one-pdf',
    related: ['compress-pdf-to-specific-size', 'pdf-to-image', 'photo-and-signature-resizer'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'UtilitiesApplication',
  },
  {
    slug: 'pdf-to-image',
    blurb: 'Save PDF pages as JPG or PNG images, one by one or as a ZIP.',
    name: 'PDF to image',
    title: 'PDF to Image Converter: Save Pages as JPG or PNG',
    h1: 'PDF to Image Converter',
    primaryPhrase: 'pdf to image converter',
    description:
      'Convert PDF pages to JPG or PNG images in your browser. Choose the pages and quality, then download single images or all pages as a ZIP file.',
    category: 'exam-documents',
    guide: 'how-to-convert-pdf-pages-to-images',
    related: ['image-to-pdf', 'compress-pdf-to-specific-size', 'photo-and-signature-resizer'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'UtilitiesApplication',
  },
  {
    slug: 'percentage-calculator',
    blurb: 'Percent of a number, percent change and marks percentage in one place.',
    name: 'Percentage calculator',
    title: 'Percentage Calculator: Marks, Change and Share',
    h1: 'Percentage Calculator',
    primaryPhrase: 'percentage calculator',
    description:
      'Free percentage calculator for marks, discounts and change. Find X% of a number, what percent one number is of another, and percentage increase or decrease.',
    category: 'calculators',
    guide: 'how-to-calculate-percentage-of-marks',
    related: ['marks-to-grade-converter', 'cgpa-to-percentage-calculator', 'age-calculator-for-cut-off-date'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'EducationalApplication',
  },
  {
    slug: 'cgpa-to-percentage-calculator',
    blurb: 'Convert CGPA to percentage with a multiplier you can change.',
    name: 'CGPA to percentage converter',
    title: 'CGPA to Percentage Calculator with Custom Multiplier',
    h1: 'CGPA to Percentage Calculator',
    primaryPhrase: 'cgpa to percentage calculator',
    description:
      'Convert CGPA to percentage and back using a multiplier you can change. Choose a 10-point scale or your own, and see the formula worked out step by step.',
    category: 'calculators',
    guide: 'how-to-convert-cgpa-to-percentage',
    related: ['percentage-calculator', 'marks-to-grade-converter', 'age-calculator-for-cut-off-date'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'EducationalApplication',
  },
  {
    slug: 'age-calculator-for-cut-off-date',
    blurb: 'Exact age in years, months and days on any cut-off date, with limit check.',
    name: 'Age calculator for a cut-off date',
    title: 'Age Calculator for Cut-Off Date: Years, Months, Days',
    h1: 'Age Calculator for a Cut-Off Date',
    primaryPhrase: 'age calculator for cut off date',
    description:
      'Find your exact age in years, months and days on any cut-off date. Add the minimum and maximum age limit to check eligibility from the notification.',
    category: 'calculators',
    guide: 'how-to-calculate-age-on-a-cut-off-date',
    related: ['percentage-calculator', 'cgpa-to-percentage-calculator', 'photo-and-signature-resizer'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'UtilitiesApplication',
  },
  {
    slug: 'seating-plan-generator',
    blurb: 'Build a printable seating chart from rows, columns and a name list.',
    name: 'Seating plan generator',
    title: 'Seating Plan Generator for Classroom and Exam Hall',
    h1: 'Seating Plan Generator',
    primaryPhrase: 'seating plan generator',
    description:
      'Make a classroom or exam hall seating plan in seconds. Enter rows, columns and student names or roll numbers, shuffle if needed and print the chart.',
    category: 'classroom',
    guide: 'how-to-make-an-exam-hall-seating-plan',
    related: ['random-student-picker', 'marks-to-grade-converter', 'percentage-calculator'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'EducationalApplication',
  },
  {
    slug: 'random-student-picker',
    blurb: 'Pick students at random without repeats, or split the class into groups.',
    name: 'Random student picker',
    title: 'Random Student Picker: Fair Name Selector for Class',
    h1: 'Random Student Picker',
    primaryPhrase: 'random student picker',
    description:
      'Pick a random student or make groups from a class list. Names are never repeated until everyone has been picked, and the list stays in your browser.',
    category: 'classroom',
    guide: 'how-to-pick-students-fairly-in-class',
    related: ['seating-plan-generator', 'marks-to-grade-converter', 'percentage-calculator'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'EducationalApplication',
  },
  {
    slug: 'marks-to-grade-converter',
    blurb: 'Grade one mark or a whole class using boundaries you can edit.',
    name: 'Marks to grade converter',
    title: 'Marks to Grade Converter with Editable Grade Scale',
    h1: 'Marks to Grade Converter',
    primaryPhrase: 'marks to grade converter',
    description:
      'Convert marks to grades for one student or a whole class. Edit the grade boundaries to match your school and paste a list to grade everyone at once.',
    category: 'classroom',
    guide: 'how-to-convert-marks-to-grades',
    related: ['percentage-calculator', 'cgpa-to-percentage-calculator', 'seating-plan-generator'],
    lastUpdated: '2026-10-04',
    applicationCategory: 'EducationalApplication',
  },
];

export const getTool = (slug: string) => {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool: ${slug}`);
  return t;
};
