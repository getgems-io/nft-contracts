import {decodeOffChainContent, encodeOffChainContent, flattenSnakeCell, makeSnakeCell} from "./nftContent";

describe('nft content encoder', () => {
    it('should encode off chain content', async () => {
        let text = `Apple was founded as Apple Computer Company on April 1, 1976, by Steve Jobs, Steve Wozniak and Ronald Wayne to develop and sell Wozniak's Apple I personal computer. It was incorporated by Jobs and Wozniak as Apple Computer, Inc. in 1977 and the company's next computer, the Apple II became a best seller. Apple went public in 1980, to instant financial success. The company went onto develop new computers featuring innovative graphical user interfaces, including the original Macintosh, announced in a critically acclaimed advertisement, "1984", directed by Ridley Scott. By 1985, the high cost of its products and power struggles between executives caused problems. Wozniak stepped back from Apple amicably, while Jobs resigned to found NeXT, taking some Apple employees with him.`

        expect(decodeOffChainContent(encodeOffChainContent(text))).toEqual(text)
    })
})