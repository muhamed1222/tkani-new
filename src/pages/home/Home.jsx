import { Slider } from "../../components/slider/Slider"
import styles from "./Home.module.css"

export const Home =()=> {
    return (
        <>
            <div className="md:flex flex-row justify-between">
                <Slider />
                <Slider />
            </div>
        </>
    )
}