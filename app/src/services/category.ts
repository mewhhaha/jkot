import EldenRingImage from "~/images/elden-ring.jpg";
import DOTA2Image from "~/images/dota2.jpg";
import HumankindImage from "~/images/humankind.jpg";
import VRisingImage from "~/images/v-rising.jpg";
import CitizenSleeperImage from "~/images/citizen-sleeper.jpg";
import DiscoElysiumImage from "~/images/disco-elysium.jpg";
import GwentRogueMageImage from "~/images/gwent-rogue-mage.png";

export const categories = {
  "Elden Ring": [
    "https://en.bandainamcoent.eu/elden-ring/elden-ring",
    EldenRingImage,
  ],
  DOTA2: ["https://www.dota2.com/", DOTA2Image],
  Humankind: ["https://humankind.game/", HumankindImage],
  "V-Rising": ["https://playvrising.com/", VRisingImage],
  "Citizen Sleeper": [
    "https://www.fellowtraveller.games/citizen-sleeper",
    CitizenSleeperImage,
  ],
  "Disco Elysium": ["https://discoelysium.com/", DiscoElysiumImage],
  "GWENT: Rogue Mage": [
    "https://www.playgwent.com/en/news/44365/gwent-rogue-mage-is-here",
    GwentRogueMageImage,
  ],
} as const;
