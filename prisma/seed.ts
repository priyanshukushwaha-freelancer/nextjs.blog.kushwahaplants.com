import { PrismaClient, Role, PublishStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@kushwahaplants.com' },
    update: {},
    create: {
      email: 'admin@kushwahaplants.com',
      name: 'Dr. P. K. Kushwaha',
      role: Role.SUPERADMIN,
      passwordHash: '$2b$12$KkQ1bKkQ1bKkQ1bKkQ1bKe4pE9vJkZp2qjQ1bKkQ1bKkQ1bKkQ1bK', // dummy hash
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@kushwahaplants.com' },
    update: {},
    create: {
      email: 'author@kushwahaplants.com',
      name: 'Shastri Govind Lal',
      role: Role.AUTHOR,
      passwordHash: '$2b$12$KkQ1bKkQ1bKkQ1bKkQ1bKe4pE9vJkZp2qjQ1bKkQ1bKkQ1bKkQ1bK', // dummy hash
    },
  });

  // 2. Create Families
  const lamiaceae = await prisma.family.upsert({
    where: { slug: 'lamiaceae' },
    update: {},
    create: {
      slug: 'lamiaceae',
      name: 'Lamiaceae',
      description: 'The mint family, known for aromatic herbs with square stems, opposite leaves, and open-lipped flowers.',
    },
  });

  const meliaceae = await prisma.family.upsert({
    where: { slug: 'meliaceae' },
    update: {},
    create: {
      slug: 'meliaceae',
      name: 'Meliaceae',
      description: 'The mahogany family, mostly flowering trees and shrubs characterized by alternate, pinnate leaves.',
    },
  });

  const solanaceae = await prisma.family.upsert({
    where: { slug: 'solanaceae' },
    update: {},
    create: {
      slug: 'solanaceae',
      name: 'Solanaceae',
      description: 'The nightshade family, containing a wide range of agricultural crops, medicinal herbs, and shrubs.',
    },
  });

  // 3. Create Medicinal Actions
  const adaptogen = await prisma.medicinalAction.upsert({
    where: { slug: 'adaptogenic' },
    update: {},
    create: { slug: 'adaptogenic', name: 'Adaptogenic', description: 'Helps the body adapt to stress and exert a normalizing effect.' },
  });

  const antiInflammatory = await prisma.medicinalAction.upsert({
    where: { slug: 'anti-inflammatory' },
    update: {},
    create: { slug: 'anti-inflammatory', name: 'Anti-inflammatory', description: 'Reduces inflammation and swelling.' },
  });

  const antimicrobial = await prisma.medicinalAction.upsert({
    where: { slug: 'antimicrobial' },
    update: {},
    create: { slug: 'antimicrobial', name: 'Antimicrobial', description: 'Kills or inhibits the growth of microorganisms.' },
  });

  const antioxidant = await prisma.medicinalAction.upsert({
    where: { slug: 'antioxidant' },
    update: {},
    create: { slug: 'antioxidant', name: 'Antioxidant', description: 'Inhibits oxidation and scavenges free radicals.' },
  });

  // 4. Create Diseases / Indications
  const stress = await prisma.disease.upsert({
    where: { slug: 'stress-and-anxiety' },
    update: {},
    create: { slug: 'stress-and-anxiety', name: 'Stress & Anxiety', description: 'Chronic psychological stress, fatigue, and nervous tension.' },
  });

  const skinInfection = await prisma.disease.upsert({
    where: { slug: 'skin-diseases' },
    update: {},
    create: { slug: 'skin-diseases', name: 'Skin Diseases', description: 'Acne, eczema, psoriasis, and fungal infections.' },
  });

  const diabetes = await prisma.disease.upsert({
    where: { slug: 'diabetes-mellitus' },
    update: {},
    create: { slug: 'diabetes-mellitus', name: 'Diabetes Mellitus', description: 'Hyperglycemia and impaired insulin response.' },
  });

  const arthritis = await prisma.disease.upsert({
    where: { slug: 'rheumatoid-arthritis' },
    update: {},
    create: { slug: 'rheumatoid-arthritis', name: 'Rheumatoid Arthritis', description: 'Chronic inflammatory disorder affecting joints.' },
  });

  // 5. Create Plant Parts
  const leaves = await prisma.plantPart.upsert({
    where: { slug: 'leaves' },
    update: {},
    create: { slug: 'leaves', name: 'Leaves', description: 'The main photosynthetic organs, rich in volatile oils.' },
  });

  const roots = await prisma.plantPart.upsert({
    where: { slug: 'roots' },
    update: {},
    create: { slug: 'roots', name: 'Roots', description: 'Underground parts containing concentrated alkaloids.' },
  });

  const bark = await prisma.plantPart.upsert({
    where: { slug: 'bark' },
    update: {},
    create: { slug: 'bark', name: 'Bark', description: 'Outer protective layer containing tannins and active resins.' },
  });

  // 6. Create Plants
  // A. Tulsi
  const tulsi = await prisma.plant.upsert({
    where: { slug: 'tulsi' },
    update: {},
    create: {
      slug: 'tulsi',
      scientificName: 'Ocimum tenuiflorum',
      englishName: 'Holy Basil',
      hindiName: 'Tulsi',
      sanskritName: 'Tulasi',
      familyId: lamiaceae.id,
      description: 'Tulsi is a sacred plant in Hindu belief and is regarded as the queen of herbs in Ayurveda. It possesses strong adaptogenic, antimicrobial, and respiratory healing properties.',
      conservation: 'LC (Least Concern)',
      ayurvedicProps: {
        rasa: ['Katu (Pungent)', 'Tikta (Bitter)'],
        guna: ['Laghu (Light)', 'Ruksha (Dry)', 'Tikshna (Sharp)'],
        virya: ['Ushna (Hot)'],
        vipaka: ['Katu (Pungent)'],
        dosha: ['Kapha-Vata Hara (Reduces Kapha and Vata)']
      },
    },
  });

  // B. Neem
  const neem = await prisma.plant.upsert({
    where: { slug: 'neem' },
    update: {},
    create: {
      slug: 'neem',
      scientificName: 'Azadirachta indica',
      englishName: 'Neem',
      hindiName: 'Neem',
      sanskritName: 'Nimba',
      familyId: meliaceae.id,
      description: 'Neem is a highly valued tree with a long history of use in Ayurvedic medicine. Every part of the tree contains bitter limonoids (like azadirachtin) that act as powerful blood purifiers and antiseptics.',
      conservation: 'LC (Least Concern)',
      ayurvedicProps: {
        rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)'],
        guna: ['Laghu (Light)', 'Ruksha (Dry)'],
        virya: ['Sheeta (Cold)'],
        vipaka: ['Katu (Pungent)'],
        dosha: ['Pitta-Kapha Hara (Reduces Pitta and Kapha)']
      },
    },
  });

  // C. Ashwagandha
  const ashwagandha = await prisma.plant.upsert({
    where: { slug: 'ashwagandha' },
    update: {},
    create: {
      slug: 'ashwagandha',
      scientificName: 'Withania somnifera',
      englishName: 'Indian Ginseng',
      hindiName: 'Ashwagandha',
      sanskritName: 'Ashwagandha',
      familyId: solanaceae.id,
      description: 'Ashwagandha is one of the most powerful rasayana (rejuvenative) herbs in Ayurveda. It is primarily used for enhancing vitality, reducing stress levels, and supporting musculoskeletal health.',
      conservation: 'LC (Least Concern)',
      ayurvedicProps: {
        rasa: ['Tikta (Bitter)', 'Katu (Pungent)', 'Madhura (Sweet)'],
        guna: ['Laghu (Light)', 'Snigdha (Unctuous)'],
        virya: ['Ushna (Hot)'],
        vipaka: ['Madhura (Sweet)'],
        dosha: ['Vata-Kapha Hara (Reduces Vata and Kapha)']
      },
    },
  });

  // 7. Establish Relationships
  // Tulsi connections
  await prisma.plantPartToPlant.upsert({
    where: { plantId_plantPartId: { plantId: tulsi.id, plantPartId: leaves.id } },
    update: {},
    create: { plantId: tulsi.id, plantPartId: leaves.id },
  });
  await prisma.actionToPlant.upsert({
    where: { plantId_medicinalActionId: { plantId: tulsi.id, medicinalActionId: adaptogen.id } },
    update: {},
    create: { plantId: tulsi.id, medicinalActionId: adaptogen.id },
  });
  await prisma.actionToPlant.upsert({
    where: { plantId_medicinalActionId: { plantId: tulsi.id, medicinalActionId: antioxidant.id } },
    update: {},
    create: { plantId: tulsi.id, medicinalActionId: antioxidant.id },
  });
  await prisma.diseaseToPlant.upsert({
    where: { plantId_diseaseId: { plantId: tulsi.id, diseaseId: stress.id } },
    update: {},
    create: { plantId: tulsi.id, diseaseId: stress.id },
  });

  // Neem connections
  await prisma.plantPartToPlant.upsert({
    where: { plantId_plantPartId: { plantId: neem.id, plantPartId: leaves.id } },
    update: {},
    create: { plantId: neem.id, plantPartId: leaves.id },
  });
  await prisma.plantPartToPlant.upsert({
    where: { plantId_plantPartId: { plantId: neem.id, plantPartId: bark.id } },
    update: {},
    create: { plantId: neem.id, plantPartId: bark.id },
  });
  await prisma.actionToPlant.upsert({
    where: { plantId_medicinalActionId: { plantId: neem.id, medicinalActionId: antimicrobial.id } },
    update: {},
    create: { plantId: neem.id, medicinalActionId: antimicrobial.id },
  });
  await prisma.diseaseToPlant.upsert({
    where: { plantId_diseaseId: { plantId: neem.id, diseaseId: skinInfection.id } },
    update: {},
    create: { plantId: neem.id, diseaseId: skinInfection.id },
  });
  await prisma.diseaseToPlant.upsert({
    where: { plantId_diseaseId: { plantId: neem.id, diseaseId: diabetes.id } },
    update: {},
    create: { plantId: neem.id, diseaseId: diabetes.id },
  });

  // Ashwagandha connections
  await prisma.plantPartToPlant.upsert({
    where: { plantId_plantPartId: { plantId: ashwagandha.id, plantPartId: roots.id } },
    update: {},
    create: { plantId: ashwagandha.id, plantPartId: roots.id },
  });
  await prisma.actionToPlant.upsert({
    where: { plantId_medicinalActionId: { plantId: ashwagandha.id, medicinalActionId: adaptogen.id } },
    update: {},
    create: { plantId: ashwagandha.id, medicinalActionId: adaptogen.id },
  });
  await prisma.actionToPlant.upsert({
    where: { plantId_medicinalActionId: { plantId: ashwagandha.id, medicinalActionId: antiInflammatory.id } },
    update: {},
    create: { plantId: ashwagandha.id, medicinalActionId: antiInflammatory.id },
  });
  await prisma.diseaseToPlant.upsert({
    where: { plantId_diseaseId: { plantId: ashwagandha.id, diseaseId: stress.id } },
    update: {},
    create: { plantId: ashwagandha.id, diseaseId: stress.id },
  });
  await prisma.diseaseToPlant.upsert({
    where: { plantId_diseaseId: { plantId: ashwagandha.id, diseaseId: arthritis.id } },
    update: {},
    create: { plantId: ashwagandha.id, diseaseId: arthritis.id },
  });

  // 8. Add Research Papers
  await prisma.research.create({
    data: {
      title: 'Scientific Basis for the Therapeutic Use of Holy Basil (Ocimum sanctum/tenuiflorum)',
      authors: 'Marc Maurice Cohen',
      journal: 'Journal of Ayurveda and Integrative Medicine',
      year: 2014,
      doi: '10.4103/0975-9476.146554',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4296439/',
      abstract: 'There is mounting scientific evidence that tulsi can address physical, chemical, metabolic and psychological stress.',
      plantId: tulsi.id,
    },
  });

  await prisma.research.create({
    data: {
      title: 'Therapeutic Role of Azadirachta indica (Neem) in Health Management',
      authors: 'Mohammad A. Alzohairy',
      journal: 'Evidence-Based Complementary and Alternative Medicine',
      year: 2016,
      doi: '10.1155/2016/7382506',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4791507/',
      abstract: 'Neem active ingredients like Azadirachtin, Nimbin, and Nimbidin show potent antimicrobial and antioxidant activities.',
      plantId: neem.id,
    },
  });

  await prisma.research.create({
    data: {
      title: 'An Overview on Ashwagandha: A Rasayana of Ayurveda',
      authors: 'Narendra Singh, Mohit Bhalla, Prashanti de Jager, Marilena Gilca',
      journal: 'African Journal of Traditional, Complementary and Alternative Medicines',
      year: 2011,
      doi: '10.4314/ajtcam.v8i5S.9',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3252722/',
      abstract: 'Ashwagandha increases physiological resistance to stress, behaves as an adaptogen, and is safe and effective.',
      plantId: ashwagandha.id,
    },
  });

  // 9. Add Blog Posts
  const blog1 = await prisma.post.create({
    data: {
      slug: 'understanding-adaptogens-ayurvedic-perspective',
      title: 'Understanding Adaptogens: An Ayurvedic Perspective on Vitality',
      excerpt: 'Discover how adaptogenic herbs like Ashwagandha and Tulsi help modulate stress responses and balance the Kapha-Vata energetics.',
      seoTitle: 'Ayurvedic Adaptogens: How Ashwagandha and Tulsi Restore Balance',
      seoDesc: 'Read our expert editorial guide on the science and Ayurveda behind Adaptogenic medicinal plants, focusing on Withania somnifera and Holy Basil.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Introduction to Ojas and Stress' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'In modern lifestyles, stressors constantly disrupt our homeostatic balance. Ayurveda explains this through the depletion of Ojas (vital energy). Adaptogenic plants step in to restore this equilibrium.' }]
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'The Role of Ashwagandha' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Withania somnifera, popularly known as Ashwagandha, acts as a premier Rasayana, pacifying Vata and Kapha while building body mass and resilience. Research confirms its ability to lower serum cortisol levels.' }]
          }
        ]
      },
      status: PublishStatus.PUBLISHED,
      authorId: author.id,
    },
  });

  // Connect post to plants
  await prisma.postToPlant.create({
    data: { postId: blog1.id, plantId: ashwagandha.id },
  });
  await prisma.postToPlant.create({
    data: { postId: blog1.id, plantId: tulsi.id },
  });

  // 10. Add FAQs
  await prisma.faq.create({
    data: {
      question: 'What is the recommended daily dosage of Tulsi leaves?',
      answer: 'For general health, chewing 4-6 fresh Tulsi leaves or brewing them as tea once or twice daily is commonly recommended. Consult an Ayurvedic physician for therapeutical uses.',
      plantId: tulsi.id,
    },
  });

  // 11. Add References
  await prisma.reference.create({
    data: {
      citationKey: 'Charaka2026',
      citationText: 'Charaka Samhita, Sutrasthana, Chapter 25 - Detailed description of Nimba (Neem) as a bitter skin purifier.',
      plantId: neem.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
