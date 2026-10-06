import type { Video } from './types';

// Every link below comes from the author's own index of his videos:
// https://github.com/jasonchampagne/FormationVideo/blob/master/Index.md (read on 2026-10-06).
// YouTube itself was not reachable from the environment where this site was built:
// durations, chapters and exact content were NOT verified and are therefore not shown.

const VERIFIED =
  'Lien relevé dans l\'index officiel des vidéos de l\'auteur (github.com/jasonchampagne/FormationVideo, consulté le 6 octobre 2026). Vidéo non visionnée : durée et chapitres non vérifiés.';

const PRINTF_CAVEAT =
  'Les cours de C grand public utilisent en général printf et scanf. À la piscine, ils sont interdits dans tes rendus : seulement my_putchar (Day 03 à 06), puis write (Day 07+). Retiens la notion, pas la fonction d\'affichage.';

const AUTHOR = 'Jason Champagne (chaîne EvoluNoob, anciennement FormationVidéo)';

function yt(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export const C_PLAYLIST = 'https://www.youtube.com/playlist?list=PLrSOXFDHBtfEh6PCE39HERGgbbaIHhy4j';

export const VIDEOS: Video[] = [
  {
    id: 'v_c_intro', title: 'C #1 – Introduction', author: AUTHOR, url: yt('90hGCMC3Chc'), youtubeId: '90hGCMC3Chc', verified: VERIFIED,
    skills: ['structure'], days: ['d03'],
    learn: ['Première vidéo du cours de C en français de l\'auteur : présentation du langage avant d\'écrire du code.', 'Point de départ de la playlist « C – cours » (29 épisodes d\'après l\'index).'],
    caveat: PRINTF_CAVEAT, quiz: ['q_struct_1', 'q_struct_2'], exercise: 'ex_isneg',
  },
  {
    id: 'v_c_compile', title: 'C #2 – Compiler programme', author: AUTHOR, url: yt('6E-zrVV2tSg'), youtubeId: '6E-zrVV2tSg', verified: VERIFIED,
    skills: ['compile', 'structure'], days: ['d03'],
    learn: ['Comment on passe d\'un fichier .c à un programme exécutable (d\'après le titre).'],
    caveat: 'L\'environnement montré peut différer du tien : à la piscine on compile en ligne de commande avec gcc ou clang (voir aussi la vidéo « GCC – compilation en C/C++ »).',
    quiz: ['q_compile_1', 'q_compile_3'], exercise: 'ex_sum_to_n',
  },
  {
    id: 'v_c_vars', title: 'C #3 – Variables', author: AUTHOR, url: yt('kKeGTDyvi1o'), youtubeId: 'kKeGTDyvi1o', verified: VERIFIED,
    skills: ['vars'], days: ['d03'], learn: ['Déclarer et utiliser des variables (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_vars_1', 'q_vars_4'], exercise: 'ex_sum_to_n',
  },
  {
    id: 'v_c_ops', title: 'C #5 – Opérateurs', author: AUTHOR, url: yt('imc6C96-TW8'), youtubeId: 'imc6C96-TW8', verified: VERIFIED,
    skills: ['vars'], days: ['d03'], learn: ['Les opérateurs du C (d\'après le titre) : utile pour / et % dans my_put_nbr.'], caveat: PRINTF_CAVEAT,
    quiz: ['q_vars_1', 'q_vars_3'], exercise: 'ex_count_digits',
  },
  {
    id: 'v_c_cond', title: 'C #6 – Conditions', author: AUTHOR, url: yt('_MP8yZjQCgk'), youtubeId: '_MP8yZjQCgk', verified: VERIFIED,
    skills: ['cond'], days: ['d03'], learn: ['if / else et les comparaisons (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_cond_1', 'q_cond_3'], exercise: 'ex_max3',
  },
  {
    id: 'v_c_loops', title: 'C #7 – Boucles', author: AUTHOR, url: yt('in-XJLbQ1iY'), youtubeId: 'in-XJLbQ1iY', verified: VERIFIED,
    skills: ['loops'], days: ['d03'], learn: ['Répéter des instructions avec les boucles (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_loops_1', 'q_loops_3'], exercise: 'ex_print_line',
  },
  {
    id: 'v_c_funcs', title: 'C #8 – Fonctions', author: AUTHOR, url: yt('TT2RbNKr4aU'), youtubeId: 'TT2RbNKr4aU', verified: VERIFIED,
    skills: ['functions'], days: ['d03'], learn: ['Écrire et appeler ses propres fonctions (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_func_1', 'q_func_2'], exercise: 'ex_max3',
  },
  {
    id: 'v_c_modular', title: 'C #9 – Programmation modulaire', author: AUTHOR, url: yt('tXgSx9MkVjs'), youtubeId: 'tXgSx9MkVjs', verified: VERIFIED,
    skills: ['libmy', 'structure'], days: ['d07', 'd09'], learn: ['Découper un programme en plusieurs fichiers (d\'après le titre) : base des prototypes et du my.h.'],
    quiz: ['q_lib_2', 'q_struct_4'],
  },
  {
    id: 'v_c_preproc', title: 'C #10 – Préprocesseur', author: AUTHOR, url: yt('L8q1wJ8z7Ts'), youtubeId: 'L8q1wJ8z7Ts', verified: VERIFIED,
    skills: ['structs'], days: ['d09'], learn: ['#include et #define (d\'après le titre) : utile pour la macro ABS du Day 09.'],
    quiz: ['q_structs_2'],
  },
  {
    id: 'v_c_pointers', title: 'C #11 – Pointeurs', author: AUTHOR, url: yt('Qra-0U_jEKs'), youtubeId: 'Qra-0U_jEKs', verified: VERIFIED,
    skills: ['pointers'], days: ['d04'], learn: ['Adresses et pointeurs (d\'après le titre), la notion centrale du Day 04.'], caveat: PRINTF_CAVEAT,
    quiz: ['q_ptr_1', 'q_ptr_2', 'q_ptr_3'], exercise: 'ex_swap',
  },
  {
    id: 'v_c_arrays', title: 'C #12 – Tableaux', author: AUTHOR, url: yt('6nkUWnCoRp4'), youtubeId: '6nkUWnCoRp4', verified: VERIFIED,
    skills: ['arrays'], days: ['d04'], learn: ['Déclarer et parcourir des tableaux (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_arr_1', 'q_arr_2'], exercise: 'ex_array_max',
  },
  {
    id: 'v_c_strings', title: 'C #13 – Chaînes de caractères', author: AUTHOR, url: yt('tDE4FNCcP0k'), youtubeId: 'tDE4FNCcP0k', verified: VERIFIED,
    skills: ['strings', 'strfuncs'], days: ['d04', 'd06'],
    learn: ['Les chaînes et leur caractère de fin (d\'après le titre).'],
    caveat: PRINTF_CAVEAT + ' Si la vidéo utilise strlen, strcpy… (string.h), sache qu\'au Day 06 tu dois les recoder toi-même.',
    quiz: ['q_str_1', 'q_str_3'], exercise: 'ex_strlen',
  },
  {
    id: 'v_c_structs', title: 'C #14 – Structures et types', author: AUTHOR, url: yt('1Kmq-9knIUY'), youtubeId: '1Kmq-9knIUY', verified: VERIFIED,
    skills: ['structs'], days: ['d09', 'd11'], learn: ['struct et typedef (d\'après le titre).'], quiz: ['q_structs_1'], exercise: 'ex_get_color',
  },
  {
    id: 'v_c_malloc', title: 'C #15 – Allocation dynamique mémoire', author: AUTHOR, url: yt('71QV6fFl_bk'), youtubeId: '71QV6fFl_bk', verified: VERIFIED,
    skills: ['malloc'], days: ['d08'], learn: ['malloc et free (d\'après le titre).'], quiz: ['q_malloc_1', 'q_malloc_2'], exercise: 'ex_strdup',
  },
  {
    id: 'v_c_files', title: 'C #16 – Fichiers', author: AUTHOR, url: yt('j1lHUmwnmA0'), youtubeId: 'j1lHUmwnmA0', verified: VERIFIED,
    skills: ['fd'], days: ['d12'], learn: ['Lire et écrire des fichiers (d\'après le titre).'],
    caveat: 'Un cours de C standard présente souvent fopen/fread/fprintf. Le Day 12 impose les appels système open, read, write, close : la logique est proche, mais les fonctions sont différentes.',
    quiz: ['q_fd_1', 'q_fd_2'], exercise: 'ex_cat',
  },
  {
    id: 'v_c_lists', title: 'C #19 – Listes', author: AUTHOR, url: yt('FmaNOdbngLc'), youtubeId: 'FmaNOdbngLc', verified: VERIFIED,
    skills: ['lists'], days: ['d11'], learn: ['Le principe des listes chaînées (d\'après le titre).'],
    caveat: 'La structure de la vidéo est sûrement différente de linked_list_t (void *data, next) imposée au Day 11.',
    quiz: ['q_list_1', 'q_list_2'], exercise: 'ex_list_size',
  },
  {
    id: 'v_c_args', title: 'Arguments de la fonction main()', author: AUTHOR, url: yt('sy7VBahyBLI'), youtubeId: 'sy7VBahyBLI', verified: VERIFIED,
    skills: ['argv'], days: ['d07'], learn: ['argc et argv (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_argv_1', 'q_argv_3'], exercise: 'ex_print_params',
  },
  {
    id: 'v_c_recursion', title: 'Récursivité (tutoriel C)', author: AUTHOR, url: yt('3XyKY9BKVN0'), youtubeId: '3XyKY9BKVN0', verified: VERIFIED,
    skills: ['recursion'], days: ['d05'], learn: ['Le principe d\'une fonction qui s\'appelle elle-même (d\'après le titre).'], caveat: PRINTF_CAVEAT,
    quiz: ['q_rec_1', 'q_rec_2'], exercise: 'ex_factorial_rec',
  },
  {
    id: 'v_gcc', title: 'GCC – compilation en C/C++', author: AUTHOR, url: yt('gr44z0Fyx_Y'), youtubeId: 'gr44z0Fyx_Y', verified: VERIFIED,
    skills: ['compile', 'libmy'], days: ['d07', 'd08'], learn: ['Compiler en ligne de commande avec gcc (d\'après le titre).'], quiz: ['q_compile_4', 'q_lib_1'],
  },
  {
    id: 'v_staticlib', title: 'Bibliothèque statique', author: AUTHOR, url: yt('osxzRLjHDNY'), youtubeId: 'osxzRLjHDNY', verified: VERIFIED,
    skills: ['libmy'], days: ['d07'], learn: ['Créer une bibliothèque statique .a (d\'après le titre) : c\'est le libmy.a du Day 07.'], quiz: ['q_lib_1', 'q_lib_2'],
  },
  {
    id: 'v_make', title: 'Make – écrire un Makefile', author: AUTHOR, url: yt('-riHEHGP2DU'), youtubeId: '-riHEHGP2DU', verified: VERIFIED,
    skills: ['makefile'], days: ['d10'], learn: ['Écrire un Makefile (d\'après le titre).'], quiz: ['q_make_1', 'q_make_2'],
  },
  {
    id: 'v_gdb', title: 'GDB – débogage en C/C++', author: AUTHOR, url: yt('uEYlttTe3jE'), youtubeId: 'uEYlttTe3jE', verified: VERIFIED,
    skills: ['compile'], days: [], learn: ['Utiliser un débogueur pour trouver un plantage (d\'après le titre). Complément, non demandé par les PDF.'], quiz: ['q_compile_5'],
  },
  {
    id: 'v_base_conv', title: 'Conversion de base numérique', author: AUTHOR, url: yt('RdBNK43JK5c'), youtubeId: 'RdBNK43JK5c', verified: VERIFIED,
    skills: ['bases'], days: ['d06', 'd08'], learn: ['Passer d\'une base à une autre (d\'après le titre) : binaire, hexadécimal.'], quiz: ['q_bases_1', 'q_bases_3'], exercise: 'ex_putnbr_base',
  },
  {
    id: 'v_bubble', title: 'Tri à bulles', author: AUTHOR, url: yt('daATbeKXOhE'), youtubeId: 'daATbeKXOhE', verified: VERIFIED,
    skills: ['arrays'], days: ['d04', 'd07', 'd10'], learn: ['L\'algorithme de tri à bulles (d\'après le titre), utilisé pour my_sort_int_array et my_sort_params.'], quiz: ['q_arr_1'], exercise: 'ex_sort_int_array',
  },
  {
    id: 'v_shell', title: 'GNU/Linux #11 – Ligne de commande (shell)', author: AUTHOR, url: yt('DQeBbPsGoHY'), youtubeId: 'DQeBbPsGoHY', verified: VERIFIED,
    skills: ['shell'], days: ['d01'], learn: ['Premiers pas dans le terminal (d\'après le titre).'], quiz: ['q_shell_2', 'q_shell_4'],
  },
  {
    id: 'v_perms', title: 'GNU/Linux #15 – Droits et permissions', author: AUTHOR, url: yt('AvdVbh3j-50'), youtubeId: 'AvdVbh3j-50', verified: VERIFIED,
    skills: ['shell'], days: ['d01'], learn: ['Les droits rwx et chmod (d\'après le titre).'], quiz: ['q_shell_1'],
  },
  {
    id: 'v_redirect', title: 'GNU/Linux #16 – Flux, redirection', author: AUTHOR, url: yt('8ZfdwUjzxkA'), youtubeId: '8ZfdwUjzxkA', verified: VERIFIED,
    skills: ['shell', 'errors84'], days: ['d02', 'd10'], learn: ['Entrée, sortie et sortie d\'erreur, redirections > et | (d\'après le titre).'], quiz: ['q_shell_4', 'q_err_1'],
  },
  {
    id: 'v_bash', title: 'GNU/Linux #30 – Introduction bash', author: AUTHOR, url: yt('XGxtbcAzk-g'), youtubeId: 'XGxtbcAzk-g', verified: VERIFIED,
    skills: ['shell'], days: ['d02'], learn: ['Écrire des scripts bash (d\'après le titre).'], quiz: ['q_shell_3'],
  },
  {
    id: 'v_git', title: 'Git – gérer plusieurs versions de fichiers', author: AUTHOR, url: yt('CEb_JM_hsFw'), youtubeId: 'CEb_JM_hsFw', verified: VERIFIED,
    skills: ['git'], days: ['d01'], learn: ['Les bases de Git (d\'après le titre).'], quiz: ['q_git_1', 'q_git_2'],
  },
];

export const MAIN_VIDEO_ID = 'v_c_intro';

export const WRITTEN_COURSE = {
  title: 'Apprenez à programmer en C',
  author: 'OpenClassrooms (Mathieu Nebra, Ranga Gonnage)',
  url: 'https://openclassrooms.com/fr/courses/19980-apprenez-a-programmer-en-c',
  note: 'Cours écrit gratuit et progressif, trouvé par recherche web (durée annoncée : 10 h). Même remarque : il utilise printf, interdit dans tes rendus.',
};

export const video = (id: string) => VIDEOS.find((v) => v.id === id);
