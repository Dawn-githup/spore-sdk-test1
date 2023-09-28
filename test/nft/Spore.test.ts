import { resolve } from 'path';
import { readFileSync } from 'fs';
// import { describe, it } from 'vitest';
import { bytes } from '@ckb-lumos/codec';
import { OutPoint } from '@ckb-lumos/base';
import { createSpore, destroySpore, transferSpore } from '@spore-sdk/core';
import { signAndSendTransaction, TESTNET_ACCOUNTS, TESTNET_ENV } from './shared';


const localImage = './resources/test.jpg';
async function fetchInternetImage(src: string) {
  const res = await fetch(src);
  return await res.arrayBuffer();
}
async function fetchLocalImage(src: string) {
  const buffer = readFileSync(resolve(__dirname, src));
  const arrayBuffer = new Uint8Array(buffer).buffer;
  const base64 = buffer.toString('base64');
  return {
    arrayBuffer,
    arrayBufferHex: bytes.hexify(arrayBuffer),
    base64,
    base64Hex: bytes.hexify(bytes.bytifyRawString(base64)),
  };
}

// describe('Spore', function () {
//   it('Create a spore (no cluster)', async function () {
//     // Your code
//   }, 30000); // Sets the timeout for this test to 30 seconds
// });

describe('Spore', function () {
  this.timeout(30000);
  it('Create a spore (no cluster)', async function () {
    const { rpc, config } = TESTNET_ENV;
    const { CHARLIE } = TESTNET_ACCOUNTS;

    // Generate local image content
    const content = await fetchLocalImage(localImage);

    // Create cluster cell, collect inputs and pay fee
    let { txSkeleton } = await createSpore({
      data: {
        contentType: 'image/jpeg',
        content: content.arrayBuffer,
      },
      fromInfos: [CHARLIE.address],
      toLock: CHARLIE.lock,
      config,
    });

    // Sign and send transaction
    await signAndSendTransaction({
      account: CHARLIE,
      txSkeleton,
      config,
      rpc,
      send: false,
    });
  });

  this.timeout(30000);
  it('Transfer a spore', async function () {
    const { rpc, config } = TESTNET_ENV;
    const { CHARLIE, ALICE } = TESTNET_ACCOUNTS;

    const outPoint: OutPoint = {
      txHash: '0x3f94102dc70ce9fedb04776ed2013221b1dd477931b79297f7eb4c4094b4f7c8',
      index: '0x0',
    };

    // Create cluster cell, collect inputs and pay fee
    let { txSkeleton } = await transferSpore({
      outPoint: outPoint,
      fromInfos: [CHARLIE.address],
      toLock: ALICE.lock,
      config,
    });

    // Sign and send transaction
    await signAndSendTransaction({
      account: CHARLIE,
      txSkeleton,
      config,
      rpc,
      send: false,
    });
  },);

  this.timeout(30000);
  it('Destroy a spore', async function () {
    const { rpc, config } = TESTNET_ENV;
    const { CHARLIE, ALICE } = TESTNET_ACCOUNTS;

    const outPoint: OutPoint = {
      txHash: '0x28aa8dc723be732b85851c1b0dbf56e6e2c51b9f221abd86ecca4c0579e69388',
      index: '0x0',
    };

    // Create cluster cell, collect inputs and pay fee
    let { txSkeleton } = await destroySpore({
      outPoint: outPoint,
      fromInfos: [ALICE.address],
      config,
    });

    // Sign and send transaction
    await signAndSendTransaction({
      account: CHARLIE,
      txSkeleton,
      config,
      rpc,
      send: false,
    });
  },);
});
