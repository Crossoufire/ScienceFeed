import {mail} from "@/utils/constants.js";
import {FaEnvelope} from "react-icons/fa";
import {Separator} from "@/components/ui/separator";


export const Footer = () => (
    <footer className="w-full p-2 border-t border-t-neutral-700 bg-background mt-20">
        <div className="grid md:grid-cols-12 mx-auto gap-4 md:max-w-screen-xl text-center md:text-left">
            <div className="md:col-span-6 flex flex-col gap-y-1">
                <div className="text-xl flex gap-x-2 font-bold items-center justify-center md:justify-start">
                    <img src="/favicon.ico" width={16} alt="favicon"/> ScienceFeed
                </div>
                <p className="md:w-[85%]">
                    La science est une discipline qui a été définie en 1610 par{" "}
                    <a href="https://fr.wikipedia.org/wiki/Ren%C3%A9_Descartes" rel="noreferrer" target="_blank">René
                        Descartes</a>.
                </p>
                <div className="flex gap-4 mt-2">
                    <a href={`mailto:${mail}`}
                       className="mt-2 flex gap-2 items-center font-bold justify-center md:justify-start">
                        <FaEnvelope/> Contact us
                    </a>
                    <a href="https://www.buymeacoffee.com/crossoufire" rel="noreferrer" target="_blank">
                        <img
                            alt="Buy Me A Coffee"
                            src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                        />
                    </a>
                </div>

            </div>
            <div className="md:col-span-3 flex flex-col gap-y-1">
                <div className="font-bold text-xl">Powered by</div>
                <ul>
                    <li><a href="https://flask.palletsprojects.com/" rel="noreferrer" target="_blank">Flask</a></li>
                    <li><a href="https://reactjs.org/" rel="noreferrer" target="_blank">React</a></li>
                </ul>
            </div>
            <div className="md:col-span-3 flex flex-col gap-y-1">
                <div className="font-bold text-xl">Information</div>
                <ul>
                    <li><a href="https://github.com/Crossoufire/ScienceFeed" rel="noreferrer" target="_blank">GitHub</a></li>
                    <li><a href="https://github.com/Crossoufire/ScienceFeed/releases" rel="noreferrer"
                           target="_blank">Changelog</a>
                    </li>
                </ul>
            </div>
        </div>
        <Separator className="mt-3"/>
        <div className="text-center">© 2024 Copyright: ScienceFeed.info</div>
    </footer>
);
