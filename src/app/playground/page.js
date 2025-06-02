import PlaygroundClient from './PlaygroundClient';

export const metadata = {
    title: "[COMEET]",
    description: "프로덕트데이 커밋 줌 회의",
    openGraph: {
        images: ["/comeet_logo.png"],
    },
};

export default function Playground() {
    return <PlaygroundClient />;
}
