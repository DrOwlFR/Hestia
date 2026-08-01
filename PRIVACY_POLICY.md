# Politique de confidentialité

Ce document présente en termes simples la politique de confidentialité d'Hestia, c'est-à-dire la manière dont Hestia collecte et utilise vos données. Vous y trouverez la liste exhaustive de toutes les données qui sont stockées.

## 1. Quelles données collectons-nous ?

Dès lors que vous rejoignez le serveur, Hestia crée un document dans la base de données contenant :

- Votre identifiant (ID) de compte Discord : une suite de chiffres unique (et non modifiable) associée à votre compte Discord. Il se présente sous la forme d'une suite de chiffres (exemple : `123456789123456789`).
- Votre nom d'utilisateur Discord
- La date à laquelle vous avez rejoint le serveur.

Hestia récupère également au fil de vos interactions sur le serveur :
- L'information (true/false) selon laquelle vous vous êtes présenté dans le salon `🪞-galerie-des-portraits` (ou non).
- Les rôles accessoires (de salon, d'atelier, pronoms, etc.) que vous possédez (mis à jour tous les jours).
- Le nombre de messages totaux envoyés.
- Le nombre de messages envoyés par jour (sur les 30 derniers jours).
Seul le nombre de messages est stocké, pas leur contenu.

Lorsque vous liez votre compte Discord au site :
- L'identifiant (ID) de votre compte sur le site.
- Vos rôles actuels sur le site (exemple : Graine, Esperluette, Modérateur, etc.).

Certaines données spécifiques sont également stockées dans le fichier `config` d'Hestia (ce fichier n'est pas public) :
- L'ID du serveur Discord du Jardin.
- L'ID de plusieurs salons : `🪞-galerie-des-portraits`, `🪑-antichambre`, `🍵-grand-salon-parlotte`, `👩‍🎓-fumoir-non-fumeur-sérieux` et `🤝-retraites-et-cousinades`.
- L'ID de plusieurs rôles : `@Majuscules`, `@Cadratins`, `@Arobases`, `@Guillemets`, `@de salon`, `@d'atelier`, `@de bibliothèque`, `@de terrasse`, `@fumeuse non fumeuse`, `@à la retraite` et les rôles de pronoms.
- L'ID des comptes Discord des Majuscules (Admin) et des Cadratins (Modos).

À savoir que les identifiants (IDs) ne contiennent aucune information personnelle en eux-mêmes. Il s'agit simplement d'un moyen de vous identifier à coup sûr (l'ID étant unique par définition).

- Sont également stockés le nombre de messages globaux envoyés par salon (ou fil) et par mois, mais ces données ne sont pas liées à un utilisateur en particulier.

## 2. Pourquoi avons-nous besoin de ces données ?

Les données stockées le sont uniquement dans le but d'assurer le fonctionnement normal du serveur. **Aucun contenu que vous envoyez (contenu des messages, images, etc.) n'est stocké par Hestia**.

- Votre ID Discord sert à vous identifier lorsqu'Hestia a besoin de retrouver votre document dans la base de données, ou de vous attribuer (ou retirer) un rôle, par exemple. Ce dernier étant unique et non modifiable, c'est le seul moyen de retrouver un membre de façon certaine et reproductible.
- Votre nom d'utilisateur sert simplement de visuel dans la base de données pour retrouver plus facilement un membre manuellement.
- La date à laquelle vous avez rejoint le serveur sert à vérifier votre ancienneté, l'un des critères requis pour l'obtention du rôle d'accès au salon des évènements IRL (*In Real Life* : dans la vraie vie).
- Le nombre de messages totaux envoyés sert au système d'obtention du rôle d'accès au salon des évènements IRL, afin de vérifier que vous avez bien le nombre de messages requis.
- Le nombre de messages envoyés par jour sert au système d'ajout et de suppression du rôle d'accès au salon Fumoir. Ils sont stockés pendant au maximum 30 jours, puis sont supprimés automatiquement.

- L'ID de votre compte sur le site sert à faire le lien entre votre compte Discord et votre compte sur le site.
- Vos rôles sur le site servent à vous attribuer les rôles correspondants sur le serveur Discord (Graine/Esperluette) et à les changer lorsque vous êtes promu(e) de Graine à Esperluette.

- Les ID des rôles du Jardin sont stockés afin de faciliter leur attribution ou leur mention. De même, les IDs des salons et de certains membres de l'équipe de modération sont stockés dans le but de faciliter leur mention dans les règles ou les messages d'indications du bot.

- Les statistiques de messages par salon et par mois servent uniquement à l'équipe de modération du serveur pour suivre l'activité globale du serveur.

## À part Discord, partageons-nous vos données avec des tiers ?

**Non.** La base de données est stockée en ligne dans le cluster personnel du développeur, fourni par l'entreprise MongoDB Inc., mais l'entreprise n'y accède pas librement. La seule personne qui a librement accès aux données est le développeur (Midriass).

## Comment les utilisateurs peuvent-ils faire supprimer des données ou contacter le propriétaire du bot ?

Les utilisateurs du bot ne peuvent pas directement (par eux-mêmes) supprimer leurs données. Mais ils peuvent contacter le développeur (Midriass / drowl_) afin d'avoir accès à leurs données stockées et peuvent demander à les supprimer.
Cependant, il est à noter que certaines données sont strictement nécessaires au fonctionnement normal du serveur (exemple : votre identifiant). Ainsi, leur suppression obligera à vous retirer l'accès au serveur du Jardin, ou à minima à certains salons (Fumoir et/ou IRL).

Par ailleurs, toutes les données stockées sont automatiquement supprimées lorsque le membre à qui elles appartiennent quitte le serveur. Les données de liaison au site sont également supprimées lorsque le membre délie son compte.
Certaines données peuvent cependant rester accessibles dans les fichiers de sauvegarde de la base de données. Ces fichiers sont stockés hors-ligne dans un disque dur appartenant au développeur (ce disque dur n'est accessible que par lui-même). Ces sauvegardes s'effectuent automatiquement et périodiquement, une fois par semaine. 
Même si ces fichiers de sauvegarde viennent à être réimportés (dans le cadre d'une perte de données par exemple), les documents des comptes Discord ayant quitté le serveur ou s'étant déconnectés du site sont supprimés automatiquement tous les jours à 1 h du matin lors du nettoyage de la base de données.

*Pour toute question ou demande, veuillez contacter le développeur sur Discord.*