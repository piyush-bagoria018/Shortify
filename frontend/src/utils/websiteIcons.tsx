import {
  FaTwitter,
  FaYoutube,
  FaVimeo,
  FaUnsplash,
  FaLink,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaTiktok,
  FaReddit,
  FaPinterest,
  FaSnapchat,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSpotify,
  FaAmazon,
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaDropbox,
  FaEbay,
  FaPaypal,
  FaMedium,
  FaDev,
  FaStackOverflow,
  FaTwitch,
  FaBehance,
  FaDribbble,
  FaSkype,
  FaViber,
  FaLinkedinIn,
  FaGitlab,
  FaBitbucket,
  FaCodepen,
  FaEtsy,
  FaShopify,
  FaStripe,
  FaIntercom,
  FaMailchimp,
  FaHubspot,
  FaSalesforce,
  FaJira,
  FaTrello,
  FaGlobe,
  FaCode,
  FaTrophy,
} from "react-icons/fa";
import {
  SiGmail,
  SiRender,
  SiZoom,
  SiSlack,
  SiNotion,
  SiFigma,
  SiCanva,
  SiMedium,
  SiDevdotto,
  SiStackoverflow,
  SiTwitch,
  SiNetflix,
  SiBehance,
  SiDribbble,
  SiSubstack,
  SiHashnode,
  SiGitlab,
  SiBitbucket,
  SiCodepen,
  SiReplit,
  SiGlitch,
  SiHeroku,
  SiVercel,
  SiNetlify,
  SiAliexpress,
  SiShopify,
  SiStripe,
  SiPaypal,
  SiWise,
  SiRevolut,
  SiPrimevideo,
  SiCrunchyroll,
  SiYoutubetv,
  SiApplemusic,
  SiSoundcloud,
  SiPandora,
  SiTidal,
  SiFlipkart,
  SiBookmyshow,
  SiZomato,
  SiSwiggy,
  SiUber,
  SiAirbnb,
  SiExpedia,
  SiTrivago,
  SiCodeforces,
} from "react-icons/si";

export const getWebsiteIcon = (url: string) => {
  try {
    const domain = new URL(url).hostname.toLowerCase();

    // Remove www. prefix
    const cleanDomain = domain.replace(/^www\./, "");

    // Social Media
    if (cleanDomain.includes("twitter.com") || cleanDomain.includes("x.com")) {
      return <FaTwitter className="text-[#1da1f2] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("youtube.com") ||
      cleanDomain.includes("youtu.be")
    ) {
      return <FaYoutube className="text-[#FF0000] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("facebook.com") ||
      cleanDomain.includes("fb.com")
    ) {
      return <FaFacebook className="text-[#1877f2] w-5 h-5" />;
    }
    if (cleanDomain.includes("instagram.com")) {
      return <FaInstagram className="text-[#E4405F] w-5 h-5" />;
    }
    if (cleanDomain.includes("linkedin.com")) {
      return <FaLinkedin className="text-[#0077b5] w-5 h-5" />;
    }
    if (cleanDomain.includes("github.com")) {
      return <FaGithub className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("tiktok.com")) {
      return <FaTiktok className="text-[#ff0050] w-5 h-5" />;
    }
    if (cleanDomain.includes("reddit.com")) {
      return <FaReddit className="text-[#ff4500] w-5 h-5" />;
    }
    if (cleanDomain.includes("pinterest.com")) {
      return <FaPinterest className="text-[#bd081c] w-5 h-5" />;
    }
    if (cleanDomain.includes("snapchat.com")) {
      return <FaSnapchat className="text-[#fffc00] w-5 h-5" />;
    }
    if (cleanDomain.includes("whatsapp.com") || cleanDomain.includes("wa.me")) {
      return <FaWhatsapp className="text-[#25d366] w-5 h-5" />;
    }
    if (cleanDomain.includes("telegram.org") || cleanDomain.includes("t.me")) {
      return <FaTelegram className="text-[#0088cc] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("discord.com") ||
      cleanDomain.includes("discord.gg")
    ) {
      return <FaDiscord className="text-[#5865f2] w-5 h-5" />;
    }

    // Video/Media
    if (cleanDomain.includes("vimeo.com")) {
      return <FaVimeo className="text-[#1ab7ea] w-5 h-5" />;
    }
    if (cleanDomain.includes("spotify.com")) {
      return <FaSpotify className="text-[#1db954] w-5 h-5" />;
    }
    if (cleanDomain.includes("netflix.com")) {
      return <SiNetflix className="text-[#e50914] w-5 h-5" />;
    }
    if (cleanDomain.includes("twitch.tv")) {
      return <SiTwitch className="text-[#9146ff] w-5 h-5" />;
    }
    if (cleanDomain.includes("prime") && cleanDomain.includes("amazon")) {
      return <SiPrimevideo className="text-[#00a8e1] w-5 h-5" />;
    }
    if (cleanDomain.includes("crunchyroll.com")) {
      return <SiCrunchyroll className="text-[#f47521] w-5 h-5" />;
    }
    if (cleanDomain.includes("music.apple.com")) {
      return <SiApplemusic className="text-[#fa243c] w-5 h-5" />;
    }
    if (cleanDomain.includes("soundcloud.com")) {
      return <SiSoundcloud className="text-[#ff5500] w-5 h-5" />;
    }
    if (cleanDomain.includes("pandora.com")) {
      return <SiPandora className="text-[#005483] w-5 h-5" />;
    }
    if (cleanDomain.includes("tidal.com")) {
      return <SiTidal className="text-white w-5 h-5" />;
    }

    // E-commerce
    if (cleanDomain.includes("amazon.in") || cleanDomain.includes("amzn.")) {
      return <FaAmazon className="text-[#ff9900] w-5 h-5" />;
    }
    if (cleanDomain.includes("ebay.com")) {
      return <FaEbay className="text-[#e53238] w-5 h-5" />;
    }
    if (cleanDomain.includes("paypal.com")) {
      return <SiPaypal className="text-[#003087] w-5 h-5" />;
    }
    if (cleanDomain.includes("shopify.com")) {
      return <SiShopify className="text-[#7ab55c] w-5 h-5" />;
    }
    if (cleanDomain.includes("stripe.com")) {
      return <SiStripe className="text-[#008cdd] w-5 h-5" />;
    }
    if (cleanDomain.includes("etsy.com")) {
      return <FaEtsy className="text-[#f16521] w-5 h-5" />;
    }
    if (cleanDomain.includes("aliexpress.com")) {
      return <SiAliexpress className="text-[#ff6a00] w-5 h-5" />;
    }
    if (cleanDomain.includes("flipkart.com")) {
      return <SiFlipkart className="text-[#047bd6] w-5 h-5" />;
    }

    // Developer/Tech Tools
    if (
      cleanDomain.includes("google.com") ||
      cleanDomain.includes("gmail.com")
    ) {
      return <FaGoogle className="text-[#4285f4] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("microsoft.com") ||
      cleanDomain.includes("office.com") ||
      cleanDomain.includes("outlook.com")
    ) {
      return <FaMicrosoft className="text-[#00bcf2] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("apple.com") ||
      cleanDomain.includes("icloud.com")
    ) {
      return <FaApple className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("dropbox.com")) {
      return <FaDropbox className="text-[#0061ff] w-5 h-5" />;
    }
    if (cleanDomain.includes("stackoverflow.com")) {
      return <SiStackoverflow className="text-[#f48024] w-5 h-5" />;
    }
    if (cleanDomain.includes("gitlab.com")) {
      return <SiGitlab className="text-[#fca326] w-5 h-5" />;
    }
    if (cleanDomain.includes("bitbucket.org")) {
      return <SiBitbucket className="text-[#0052cc] w-5 h-5" />;
    }
    if (cleanDomain.includes("codepen.io")) {
      return <SiCodepen className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("replit.com") || cleanDomain.includes("repl.it")) {
      return <SiReplit className="text-[#f26207] w-5 h-5" />;
    }
    if (cleanDomain.includes("glitch.com")) {
      return <SiGlitch className="text-[#3333ff] w-5 h-5" />;
    }
    if (cleanDomain.includes("codeforces.com")) {
      return <SiCodeforces className="text-[#1f8acb] w-5 h-5" />;
    }
    if (cleanDomain.includes("heroku.com")) {
      return <SiHeroku className="text-[#430098] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("vercel.app") ||
      cleanDomain.includes("vercel.com")
    ) {
      return <SiVercel className="text-white w-5 h-5" />;
    }
    if (
      cleanDomain.includes("netlify.app") ||
      cleanDomain.includes("netlify.com")
    ) {
      return <SiNetlify className="text-[#00c7b7] w-5 h-5" />;
    }
    if (cleanDomain.includes("zoom.us")) {
      return <SiZoom className="text-[#2d8cff] w-5 h-5" />;
    }
    if (cleanDomain.includes("slack.com")) {
      return <SiSlack className="text-[#4a154b] w-5 h-5" />;
    }
    if (
      cleanDomain.includes("notion.so") ||
      cleanDomain.includes("notion.com")
    ) {
      return <SiNotion className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("figma.com")) {
      return <SiFigma className="text-[#f24e1e] w-5 h-5" />;
    }
    if (cleanDomain.includes("canva.com")) {
      return <SiCanva className="text-[#00c4cc] w-5 h-5" />;
    }

    // Business/Productivity Tools
    if (cleanDomain.includes("trello.com")) {
      return <FaTrello className="text-[#0079bf] w-5 h-5" />;
    }
    if (cleanDomain.includes("jira") && cleanDomain.includes("atlassian")) {
      return <FaJira className="text-[#0052cc] w-5 h-5" />;
    }
    if (cleanDomain.includes("hubspot.com")) {
      return <FaHubspot className="text-[#ff7a59] w-5 h-5" />;
    }
    if (cleanDomain.includes("salesforce.com")) {
      return <FaSalesforce className="text-[#00a1e0] w-5 h-5" />;
    }
    if (cleanDomain.includes("mailchimp.com")) {
      return <FaMailchimp className="text-[#ffe01b] w-5 h-5" />;
    }
    if (cleanDomain.includes("intercom.com")) {
      return <FaIntercom className="text-[#1f8ded] w-5 h-5" />;
    }

    // Content/Media Platforms
    if (cleanDomain.includes("medium.com")) {
      return <SiMedium className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("dev.to")) {
      return <SiDevdotto className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("substack.com")) {
      return <SiSubstack className="text-[#ff6719] w-5 h-5" />;
    }
    if (cleanDomain.includes("hashnode.com")) {
      return <SiHashnode className="text-[#2962ff] w-5 h-5" />;
    }
    if (cleanDomain.includes("behance.net")) {
      return <SiBehance className="text-[#1769ff] w-5 h-5" />;
    }
    if (cleanDomain.includes("dribbble.com")) {
      return <SiDribbble className="text-[#ea4c89] w-5 h-5" />;
    }

    // Travel & Services
    if (cleanDomain.includes("airbnb.com")) {
      return <SiAirbnb className="text-[#ff5a5f] w-5 h-5" />;
    }
    if (cleanDomain.includes("uber.com")) {
      return <SiUber className="text-white w-5 h-5" />;
    }
    if (cleanDomain.includes("expedia.com")) {
      return <SiExpedia className="text-[#ffc72c] w-5 h-5" />;
    }
    if (cleanDomain.includes("trivago.com")) {
      return <SiTrivago className="text-[#c77c2a] w-5 h-5" />;
    }
    if (cleanDomain.includes("zomato.com")) {
      return <SiZomato className="text-[#e23744] w-5 h-5" />;
    }
    if (cleanDomain.includes("swiggy.com")) {
      return <SiSwiggy className="text-[#fc8019] w-5 h-5" />;
    }
    if (cleanDomain.includes("bookmyshow.com")) {
      return <SiBookmyshow className="text-[#c4242b] w-5 h-5" />;
    }

    // Photo/Design
    if (cleanDomain.includes("unsplash.com")) {
      return <FaUnsplash className="text-white w-5 h-5" />;
    }

    // Default fallback
    return <FaLink className="text-[#9ca3af] w-5 h-5" />;
  } catch (error) {
    // If URL parsing fails, return default icon
    return <FaLink className="text-[#9ca3af] w-5 h-5" />;
  }
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options).replace(",", " -");
  } catch {
    return "Invalid Date";
  }
};
