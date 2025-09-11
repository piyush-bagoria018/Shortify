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
} from "react-icons/fa";
import {
  SiGmail,
  SiZoom,
  SiSlack,
  SiNotion,
  SiFigma,
  SiCanva,
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
      return <FaLink className="text-[#e50914] w-5 h-5" />;
    }

    // E-commerce
    if (cleanDomain.includes("amazon.com") || cleanDomain.includes("amzn.")) {
      return <FaAmazon className="text-[#ff9900] w-5 h-5" />;
    }

    // Tech/Tools
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
