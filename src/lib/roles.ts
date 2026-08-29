export type Team = 'VILLAGE' | 'WEREWOLVES' | 'SOLO';

export type RoleId = 
  | 'villager'
  | 'werewolf'
  | 'seer'
  | 'witch'
  | 'hunter'
  | 'cupid'
  | 'guard'
  | 'little_girl'
  | 'elder'
  | 'fool'
  | 'white_wolf';

export interface RoleDef {
  id: RoleId;
  name: string;
  subtitle: string;
  team: Team;
  nightOrder: number; // 0 = no night action, 10 = Cupid, 20 = Guard, 30 = Seer, 40 = Werewolves, 45 = White Wolf, 50 = Witch
  firstNightOnly?: boolean;
  description: string;
  shortDesc: string;
  iconName: string;
  color: string;
  accentGlow: string;
  bgGradient: string;
  quote: string;
  wakeScript: string;
}

export const ROLES: Record<RoleId, RoleDef> = {
  cupid: {
    id: 'cupid',
    name: 'Cupidon',
    subtitle: 'L\'Archer de l\'Amour',
    team: 'VILLAGE',
    nightOrder: 10,
    firstNightOnly: true,
    description: 'Au début de la première nuit, Cupidon désigne deux joueurs qui tombent éperdument amoureux. Si l\'un meurt, l\'autre meurt instantanément de chagrin.',
    shortDesc: 'Lie deux joueurs à la vie à la mort dès la première nuit.',
    iconName: 'Heart',
    color: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    bgGradient: 'from-pink-950 via-rose-900 to-black',
    quote: '« L\'amour est plus fort que la mort, mais souvent ils voyagent ensemble. »',
    wakeScript: 'Cupidon se réveille, et désigne deux âmes sœurs qui seront liées à jamais !'
  },
  guard: {
    id: 'guard',
    name: 'Salvateur',
    subtitle: 'Le Protecteur de la Nuit',
    team: 'VILLAGE',
    nightOrder: 20,
    description: 'Chaque nuit, le Salvateur protège un joueur contre l\'attaque des Loups-Garous. Il ne peut pas protéger la même personne deux nuits de suite.',
    shortDesc: 'Protège un joueur contre les morsures des loups.',
    iconName: 'Shield',
    color: '#3b82f6',
    accentGlow: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'from-blue-950 via-slate-900 to-black',
    quote: '« Sous ma garde, aucune bête ne franchira ce seuil. »',
    wakeScript: 'Le Salvateur se réveille, et désigne un joueur à protéger cette nuit.'
  },
  seer: {
    id: 'seer',
    name: 'Voyante',
    subtitle: 'L\'Œil Céleste',
    team: 'VILLAGE',
    nightOrder: 30,
    description: 'Chaque nuit, la Voyante sonde l\'âme d\'un habitant du village et découvre secrètement son véritable rôle.',
    shortDesc: 'Découvre l\'identité secrète d\'un joueur chaque nuit.',
    iconName: 'Eye',
    color: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    bgGradient: 'from-purple-950 via-indigo-950 to-black',
    quote: '« Les étoiles ne mentent jamais, les visages si. »',
    wakeScript: 'La Voyante se réveille, et sonde l\'âme d\'un villageois de son choix.'
  },
  werewolf: {
    id: 'werewolf',
    name: 'Loup-Garou',
    subtitle: 'La Bête de l\'Ombre',
    team: 'WEREWOLVES',
    nightOrder: 40,
    description: 'Chaque nuit, les Loups-Garous se réunissent dans le plus grand secret pour dévorer un villageois.',
    shortDesc: 'Chasse en meute pour dévorer les villageois chaque nuit.',
    iconName: 'Moon',
    color: '#ef4444',
    accentGlow: 'rgba(239, 68, 68, 0.5)',
    bgGradient: 'from-red-950 via-neutral-900 to-black',
    quote: '« La chair des innocents a la saveur de la peur. »',
    wakeScript: 'Les Loups-Garous se réveillent, se reconnaissent et choisissent leur victime nocturne !'
  },
  white_wolf: {
    id: 'white_wolf',
    name: 'Loup Blanc',
    subtitle: 'Le Prédateur Solitaire',
    team: 'SOLO',
    nightOrder: 45,
    description: 'Loup parmi les loups, il se réveille une nuit sur deux après les loups pour dévorer un loup-garou. Son but est d\'être l\'unique survivant.',
    shortDesc: 'Infiltré chez les loups, il cherche à être le seul survivant.',
    iconName: 'Sparkles',
    color: '#e2e8f0',
    accentGlow: 'rgba(226, 232, 240, 0.4)',
    bgGradient: 'from-slate-800 via-gray-900 to-black',
    quote: '« La meute n\'est qu\'un troupeau de plus à égorger. »',
    wakeScript: 'Le Loup Blanc se réveille en secret pour dévorer un de ses compères loups...'
  },
  witch: {
    id: 'witch',
    name: 'Sorcière',
    subtitle: 'Maîtresse des Potions',
    team: 'VILLAGE',
    nightOrder: 50,
    description: 'Possède deux potions à usage unique : une potion de Guérison pour sauver la victime des loups, et une potion d\'Empoisonnement pour tuer un joueur ciblé.',
    shortDesc: 'Possède 1 potion de vie pour sauver et 1 potion de mort pour éliminer.',
    iconName: 'FlaskConical',
    color: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    bgGradient: 'from-emerald-950 via-teal-950 to-black',
    quote: '« Une goutte pour offrir le souffle, une larme pour l\'éteindre. »',
    wakeScript: 'La Sorcière se réveille. Elle découvre la victime des loups et décide d\'utiliser ou non ses mystérieux élixirs.'
  },
  villager: {
    id: 'villager',
    name: 'Simple Villageois',
    subtitle: 'L\'Habitant de Thiercelieux',
    team: 'VILLAGE',
    nightOrder: 0,
    description: 'N\'a aucun pouvoir surnaturel. Sa seule force réside dans son intuition, son analyse et son vote lors du conseil de village.',
    shortDesc: 'Débat et vote de jour pour démasquer les monstres.',
    iconName: 'Users',
    color: '#eab308',
    accentGlow: 'rgba(234, 179, 8, 0.3)',
    bgGradient: 'from-amber-950 via-stone-900 to-black',
    quote: '« Je n\'ai que ma voix, mais ensemble elle sera le tonnerre qui chassera la bête. »',
    wakeScript: ''
  },
  hunter: {
    id: 'hunter',
    name: 'Chasseur',
    subtitle: 'Le Tireur d\'Élite',
    team: 'VILLAGE',
    nightOrder: 0,
    description: 'S\'il se fait dévorer par les loups ou éliminer par le vote du village, le Chasseur a le pouvoir de répliquer immédiatement en abattant un joueur de son choix dans son dernier souffle.',
    shortDesc: 'Tire un dernier coup fatal à sa mort pour emporter un suspect.',
    iconName: 'Crosshair',
    color: '#f97316',
    accentGlow: 'rgba(249, 115, 22, 0.4)',
    bgGradient: 'from-orange-950 via-zinc-900 to-black',
    quote: '« Si je tombe, mon fusil partira avec moi... et quelqu\'un m\'accompagnera en enfer. »',
    wakeScript: ''
  },
  little_girl: {
    id: 'little_girl',
    name: 'Petite Fille',
    subtitle: 'L\'Espionne Nocturne',
    team: 'VILLAGE',
    nightOrder: 0,
    description: 'Peut discrètement ouvrir les yeux pendant la nuit des Loups-Garous pour les espionner. Mais si les loups la surprennent, elle meurt immédiatement !',
    shortDesc: 'Peut entr\'ouvrir les yeux la nuit pour débusquer les loups.',
    iconName: 'Smile',
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.4)',
    bgGradient: 'from-rose-950 via-neutral-900 to-black',
    quote: '« Chuuut... Je vous vois sous la lune ! »',
    wakeScript: ''
  },
  elder: {
    id: 'elder',
    name: 'Ancien',
    subtitle: 'Le Doyen Résistant',
    team: 'VILLAGE',
    nightOrder: 0,
    description: 'Survit à la première attaque des Loups-Garous (il faut deux attaques pour le tuer). Mais si le village le lynche, tous les villageois perdent leurs pouvoirs.',
    shortDesc: 'Résiste à 1 attaque de loup. Ne doit pas être lynché par le village.',
    iconName: 'Scroll',
    color: '#d97706',
    accentGlow: 'rgba(217, 119, 6, 0.4)',
    bgGradient: 'from-yellow-950 via-neutral-900 to-black',
    quote: '« J\'ai connu trop d\'hivers pour périr sous une simple griffe. »',
    wakeScript: ''
  },
  fool: {
    id: 'fool',
    name: 'Idiot du Village',
    subtitle: 'L\'Innocent Béni',
    team: 'VILLAGE',
    nightOrder: 0,
    description: 'S\'il est voté pour mourir par le village, son identité est révélée et il est gracié. En revanche, il perd son droit de vote pour le reste de la partie.',
    shortDesc: 'Gracié au premier lynchage du village, mais perd son droit de vote.',
    iconName: 'Laugh',
    color: '#84cc16',
    accentGlow: 'rgba(132, 204, 22, 0.4)',
    bgGradient: 'from-lime-950 via-neutral-900 to-black',
    quote: '« Vous me condamnez ? Mais je ne comprends même pas de quoi on parle ! »',
    wakeScript: ''
  }
};

export const DEFAULT_PLAYER_NAMES = [
  'Alexandre',
  'Camille',
  'Thomas',
  'Léa',
  'Lucas',
  'Sarah',
  'Antoine',
  'Emma'
];

export function getRecommendedDeck(playerCount: number): RoleId[] {
  if (playerCount < 5) {
    return ['werewolf', 'seer', 'witch', 'villager'];
  }
  if (playerCount === 5) {
    return ['werewolf', 'seer', 'witch', 'hunter', 'villager'];
  }
  if (playerCount === 6) {
    return ['werewolf', 'werewolf', 'seer', 'witch', 'hunter', 'villager'];
  }
  if (playerCount === 7) {
    return ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'cupid'];
  }
  if (playerCount === 8) {
    return ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'villager'];
  }
  if (playerCount === 9) {
    return ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'elder', 'villager'];
  }
  if (playerCount === 10) {
    return ['werewolf', 'werewolf', 'white_wolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'elder', 'villager'];
  }
  // 11+
  const roles: RoleId[] = ['werewolf', 'werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'elder', 'fool'];
  while (roles.length < playerCount) {
    roles.push('villager');
  }
  return roles;
}
