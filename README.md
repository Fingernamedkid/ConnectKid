# ConnectKid

## Aperçu
ConnectKid est une application conçue pour aider les parents à rester connectés avec leurs enfants. Elle offre un suivi de localisation en temps réel, des fonctionnalités de messagerie et d'appel, garantissant ainsi la sécurité des enfants à tout moment. L'application comprend également un système d'alerte d'urgence qui avertit les parents lorsque leur enfant est en danger.

## Fonctionnalités
- **Messagerie et Appels** : Communiquez avec vos enfants via des messages texte et des appels.
- **Suivi de Localisation en Temps Réel** : Suivez l'emplacement de votre enfant à l'aide d'un appareil Raspberry Pi.
- **Surveillance de la Vitesse** : Si un enfant se déplace à une vitesse anormalement élevée, son emplacement est mis en évidence en rouge sur la carte.
- **Alerte d'Urgence** : Les enfants peuvent appuyer sur un bouton d'urgence pour avertir immédiatement leurs parents.

## Plateformes
- **Version Web** : Essayez ConnectKid sur le web.
- **Application Android** : Disponible en téléchargement sur les appareils Android.

## Démarrage
### 1. Création d'un Compte
- Inscrivez-vous pour obtenir un compte ConnectKid.
- Vous recevrez un **ID de pair** unique.

### 2. Ajouter votre Enfant
- Saisissez l'**ID de pair** de votre enfant pour l'ajouter à votre liste de contacts.
- Une fois ajouté, vous pouvez démarrer une conversation avec lui.
- Vous pouvez également l'appeler en cliquant sur l'icône d'appel dans le contact.
- Vous pouvez maintenant voir sa localisation en temps réel sur la carte.
- Son marqueur sera affiché en :
  - **Vert** : Vitesse normale.
  - **Rouge** : Vitesse anormalement élevée (danger possible).

### 3. Configuration de l'Appareil Raspberry Pi
- Le Raspberry Pi agit comme un traqueur de localisation pour votre enfant.
- Pour l'associer à un compte :
  1. Saisissez l'**ID de pair** du compte de l'enfant dans la configuration du Raspberry Pi.
  2. L'association sera enregistrée pour une utilisation future.
  3. Une fois l'application lancée, elle enverra la localisation de l'enfant **chaque seconde** pour un suivi en temps réel.
  4. L'appareil associé peut être supprimé dans la section des appareils.

## Système d'Alerte d'Urgence
- Si votre enfant est en danger, il peut appuyer sur le **bouton d'urgence**.
- Cela envoie une **notification d'alerte instantanée** sur votre appareil.
- Vous pourrez voir immédiatement sa localisation.

## Installation
### Version Web
- Visitez [ConnectKid Web](https://connectkidweb-56d2e5575ada.herokuapp.com/) pour accéder à l'application en ligne.

### Version Android
- Téléchargez l'application depuis le Google Play Store (bientôt disponible).

## Contribution
Si vous souhaitez contribuer à ConnectKid, n'hésitez pas à forker le dépôt et à soumettre des pull requests.

## Licence
Ce projet est sous licence MIT.

