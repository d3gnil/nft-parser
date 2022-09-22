require("dotenv").config();
const config = require("config");
const Web3 = require("web3");
const { OpenSeaSDK, Network } = require("opensea-js");
const sdk = require("api")("@opensea/v1.0#7dtmkl3ojw4vb");
const BigNumber = require("big-number");
const retry = require("@lifeomic/attempt").retry;
const { Telegraf } = require("telegraf");
const axios = require("axios");

const collection = config.get("collection");
let botConfig = config.util.toObject(config.get("tgBot"));
const seaportABI = [
  {
    inputs: [
      { internalType: "address", name: "conduitController", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "BadContractSignature", type: "error" },
  { inputs: [], name: "BadFraction", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BadReturnValueFromERC20OnTransfer",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint8", name: "v", type: "uint8" }],
    name: "BadSignatureV",
    type: "error",
  },
  {
    inputs: [],
    name: "ConsiderationCriteriaResolverOutOfRange",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "orderIndex", type: "uint256" },
      { internalType: "uint256", name: "considerationIndex", type: "uint256" },
      { internalType: "uint256", name: "shortfallAmount", type: "uint256" },
    ],
    name: "ConsiderationNotMet",
    type: "error",
  },
  { inputs: [], name: "CriteriaNotEnabledForItem", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256[]", name: "identifiers", type: "uint256[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    name: "ERC1155BatchTransferGenericFailure",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "EtherTransferGenericFailure",
    type: "error",
  },
  { inputs: [], name: "InexactFraction", type: "error" },
  { inputs: [], name: "InsufficientEtherSupplied", type: "error" },
  { inputs: [], name: "Invalid1155BatchTransferEncoding", type: "error" },
  { inputs: [], name: "InvalidBasicOrderParameterEncoding", type: "error" },
  {
    inputs: [{ internalType: "address", name: "conduit", type: "address" }],
    name: "InvalidCallToConduit",
    type: "error",
  },
  { inputs: [], name: "InvalidCanceller", type: "error" },
  {
    inputs: [
      { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
      { internalType: "address", name: "conduit", type: "address" },
    ],
    name: "InvalidConduit",
    type: "error",
  },
  { inputs: [], name: "InvalidERC721TransferAmount", type: "error" },
  { inputs: [], name: "InvalidFulfillmentComponentData", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "InvalidMsgValue",
    type: "error",
  },
  { inputs: [], name: "InvalidNativeOfferItem", type: "error" },
  { inputs: [], name: "InvalidProof", type: "error" },
  {
    inputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    name: "InvalidRestrictedOrder",
    type: "error",
  },
  { inputs: [], name: "InvalidSignature", type: "error" },
  { inputs: [], name: "InvalidSigner", type: "error" },
  { inputs: [], name: "InvalidTime", type: "error" },
  {
    inputs: [],
    name: "MismatchedFulfillmentOfferAndConsiderationComponents",
    type: "error",
  },
  {
    inputs: [{ internalType: "enum Side", name: "side", type: "uint8" }],
    name: "MissingFulfillmentComponentOnAggregation",
    type: "error",
  },
  { inputs: [], name: "MissingItemAmount", type: "error" },
  { inputs: [], name: "MissingOriginalConsiderationItems", type: "error" },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "NoContract",
    type: "error",
  },
  { inputs: [], name: "NoReentrantCalls", type: "error" },
  { inputs: [], name: "NoSpecifiedOrdersAvailable", type: "error" },
  {
    inputs: [],
    name: "OfferAndConsiderationRequiredOnFulfillment",
    type: "error",
  },
  { inputs: [], name: "OfferCriteriaResolverOutOfRange", type: "error" },
  {
    inputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    name: "OrderAlreadyFilled",
    type: "error",
  },
  { inputs: [], name: "OrderCriteriaResolverOutOfRange", type: "error" },
  {
    inputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    name: "OrderIsCancelled",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    name: "OrderPartiallyFilled",
    type: "error",
  },
  { inputs: [], name: "PartialFillsNotEnabledForOrder", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "identifier", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "TokenTransferGenericFailure",
    type: "error",
  },
  { inputs: [], name: "UnresolvedConsiderationCriteria", type: "error" },
  { inputs: [], name: "UnresolvedOfferCriteria", type: "error" },
  { inputs: [], name: "UnusedItemParameters", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newCounter",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "offerer",
        type: "address",
      },
    ],
    name: "CounterIncremented",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "offerer",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "zone", type: "address" },
    ],
    name: "OrderCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "offerer",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "zone", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        components: [
          { internalType: "enum ItemType", name: "itemType", type: "uint8" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "identifier", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        indexed: false,
        internalType: "struct SpentItem[]",
        name: "offer",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "enum ItemType", name: "itemType", type: "uint8" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "identifier", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          {
            internalType: "address payable",
            name: "recipient",
            type: "address",
          },
        ],
        indexed: false,
        internalType: "struct ReceivedItem[]",
        name: "consideration",
        type: "tuple[]",
      },
    ],
    name: "OrderFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "offerer",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "zone", type: "address" },
    ],
    name: "OrderValidated",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "address", name: "zone", type: "address" },
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              {
                internalType: "uint256",
                name: "identifierOrCriteria",
                type: "uint256",
              },
              { internalType: "uint256", name: "startAmount", type: "uint256" },
              { internalType: "uint256", name: "endAmount", type: "uint256" },
            ],
            internalType: "struct OfferItem[]",
            name: "offer",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              {
                internalType: "uint256",
                name: "identifierOrCriteria",
                type: "uint256",
              },
              { internalType: "uint256", name: "startAmount", type: "uint256" },
              { internalType: "uint256", name: "endAmount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ConsiderationItem[]",
            name: "consideration",
            type: "tuple[]",
          },
          { internalType: "enum OrderType", name: "orderType", type: "uint8" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
          { internalType: "uint256", name: "salt", type: "uint256" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
          { internalType: "uint256", name: "counter", type: "uint256" },
        ],
        internalType: "struct OrderComponents[]",
        name: "orders",
        type: "tuple[]",
      },
    ],
    name: "cancel",
    outputs: [{ internalType: "bool", name: "cancelled", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "uint120", name: "numerator", type: "uint120" },
          { internalType: "uint120", name: "denominator", type: "uint120" },
          { internalType: "bytes", name: "signature", type: "bytes" },
          { internalType: "bytes", name: "extraData", type: "bytes" },
        ],
        internalType: "struct AdvancedOrder",
        name: "advancedOrder",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "enum Side", name: "side", type: "uint8" },
          { internalType: "uint256", name: "index", type: "uint256" },
          { internalType: "uint256", name: "identifier", type: "uint256" },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]",
          },
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]",
      },
      { internalType: "bytes32", name: "fulfillerConduitKey", type: "bytes32" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "fulfillAdvancedOrder",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "uint120", name: "numerator", type: "uint120" },
          { internalType: "uint120", name: "denominator", type: "uint120" },
          { internalType: "bytes", name: "signature", type: "bytes" },
          { internalType: "bytes", name: "extraData", type: "bytes" },
        ],
        internalType: "struct AdvancedOrder[]",
        name: "advancedOrders",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "enum Side", name: "side", type: "uint8" },
          { internalType: "uint256", name: "index", type: "uint256" },
          { internalType: "uint256", name: "identifier", type: "uint256" },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]",
          },
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "uint256", name: "itemIndex", type: "uint256" },
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "offerFulfillments",
        type: "tuple[][]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "uint256", name: "itemIndex", type: "uint256" },
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "considerationFulfillments",
        type: "tuple[][]",
      },
      { internalType: "bytes32", name: "fulfillerConduitKey", type: "bytes32" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "maximumFulfilled", type: "uint256" },
    ],
    name: "fulfillAvailableAdvancedOrders",
    outputs: [
      { internalType: "bool[]", name: "availableOrders", type: "bool[]" },
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "identifier", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple",
          },
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "uint256", name: "itemIndex", type: "uint256" },
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "offerFulfillments",
        type: "tuple[][]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "uint256", name: "itemIndex", type: "uint256" },
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "considerationFulfillments",
        type: "tuple[][]",
      },
      { internalType: "bytes32", name: "fulfillerConduitKey", type: "bytes32" },
      { internalType: "uint256", name: "maximumFulfilled", type: "uint256" },
    ],
    name: "fulfillAvailableOrders",
    outputs: [
      { internalType: "bool[]", name: "availableOrders", type: "bool[]" },
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "identifier", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple",
          },
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "considerationToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "considerationIdentifier",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "considerationAmount",
            type: "uint256",
          },
          { internalType: "address payable", name: "offerer", type: "address" },
          { internalType: "address", name: "zone", type: "address" },
          { internalType: "address", name: "offerToken", type: "address" },
          { internalType: "uint256", name: "offerIdentifier", type: "uint256" },
          { internalType: "uint256", name: "offerAmount", type: "uint256" },
          {
            internalType: "enum BasicOrderType",
            name: "basicOrderType",
            type: "uint8",
          },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
          { internalType: "uint256", name: "salt", type: "uint256" },
          {
            internalType: "bytes32",
            name: "offererConduitKey",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "fulfillerConduitKey",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "totalOriginalAdditionalRecipients",
            type: "uint256",
          },
          {
            components: [
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct AdditionalRecipient[]",
            name: "additionalRecipients",
            type: "tuple[]",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct BasicOrderParameters",
        name: "parameters",
        type: "tuple",
      },
    ],
    name: "fulfillBasicOrder",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct Order",
        name: "order",
        type: "tuple",
      },
      { internalType: "bytes32", name: "fulfillerConduitKey", type: "bytes32" },
    ],
    name: "fulfillOrder",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "offerer", type: "address" }],
    name: "getCounter",
    outputs: [{ internalType: "uint256", name: "counter", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "address", name: "zone", type: "address" },
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              {
                internalType: "uint256",
                name: "identifierOrCriteria",
                type: "uint256",
              },
              { internalType: "uint256", name: "startAmount", type: "uint256" },
              { internalType: "uint256", name: "endAmount", type: "uint256" },
            ],
            internalType: "struct OfferItem[]",
            name: "offer",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              {
                internalType: "uint256",
                name: "identifierOrCriteria",
                type: "uint256",
              },
              { internalType: "uint256", name: "startAmount", type: "uint256" },
              { internalType: "uint256", name: "endAmount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ConsiderationItem[]",
            name: "consideration",
            type: "tuple[]",
          },
          { internalType: "enum OrderType", name: "orderType", type: "uint8" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
          { internalType: "uint256", name: "salt", type: "uint256" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
          { internalType: "uint256", name: "counter", type: "uint256" },
        ],
        internalType: "struct OrderComponents",
        name: "order",
        type: "tuple",
      },
    ],
    name: "getOrderHash",
    outputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "orderHash", type: "bytes32" }],
    name: "getOrderStatus",
    outputs: [
      { internalType: "bool", name: "isValidated", type: "bool" },
      { internalType: "bool", name: "isCancelled", type: "bool" },
      { internalType: "uint256", name: "totalFilled", type: "uint256" },
      { internalType: "uint256", name: "totalSize", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "incrementCounter",
    outputs: [{ internalType: "uint256", name: "newCounter", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "information",
    outputs: [
      { internalType: "string", name: "version", type: "string" },
      { internalType: "bytes32", name: "domainSeparator", type: "bytes32" },
      { internalType: "address", name: "conduitController", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "uint120", name: "numerator", type: "uint120" },
          { internalType: "uint120", name: "denominator", type: "uint120" },
          { internalType: "bytes", name: "signature", type: "bytes" },
          { internalType: "bytes", name: "extraData", type: "bytes" },
        ],
        internalType: "struct AdvancedOrder[]",
        name: "advancedOrders",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint256", name: "orderIndex", type: "uint256" },
          { internalType: "enum Side", name: "side", type: "uint8" },
          { internalType: "uint256", name: "index", type: "uint256" },
          { internalType: "uint256", name: "identifier", type: "uint256" },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]",
          },
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]",
      },
      {
        components: [
          {
            components: [
              { internalType: "uint256", name: "orderIndex", type: "uint256" },
              { internalType: "uint256", name: "itemIndex", type: "uint256" },
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "offerComponents",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "uint256", name: "orderIndex", type: "uint256" },
              { internalType: "uint256", name: "itemIndex", type: "uint256" },
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "considerationComponents",
            type: "tuple[]",
          },
        ],
        internalType: "struct Fulfillment[]",
        name: "fulfillments",
        type: "tuple[]",
      },
    ],
    name: "matchAdvancedOrders",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "identifier", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple",
          },
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]",
      },
      {
        components: [
          {
            components: [
              { internalType: "uint256", name: "orderIndex", type: "uint256" },
              { internalType: "uint256", name: "itemIndex", type: "uint256" },
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "offerComponents",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "uint256", name: "orderIndex", type: "uint256" },
              { internalType: "uint256", name: "itemIndex", type: "uint256" },
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "considerationComponents",
            type: "tuple[]",
          },
        ],
        internalType: "struct Fulfillment[]",
        name: "fulfillments",
        type: "tuple[]",
      },
    ],
    name: "matchOrders",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "identifier", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple",
          },
          { internalType: "address", name: "offerer", type: "address" },
          { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "contractName", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]",
      },
    ],
    name: "validate",
    outputs: [{ internalType: "bool", name: "validated", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const wethToken = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const ethToken = "0x0000000000000000000000000000000000000000";

const retryOptions = {
  delay: 1000,
  maxAttempts: 15,
  minDelay: 500,
  jitter: true,
};

const provider = new Web3.providers.HttpProvider(
  "https://rinkeby.infura.io/v3/46ffdfe406f44caaaec571245b8e92c0"
);
const web3 = new Web3(provider);

const openseaSDK = new OpenSeaSDK(web3.currentProvider, {
  networkName: Network.Rinkeby,
});

const account = web3.eth.accounts.privateKeyToAccount(botConfig.privateKey);

const bot = new Telegraf(process.env.TG_API_KEY);

async function main() {
  let botConfig = config.util.toObject(config.get("tgBot"));
  while (botConfig.running) {//
    let availableAssets = await prepareAssets(collection.collectionSlug);
    for (let i = 0; i < availableAssets.length; i++) {
      const order = shellSort(availableAssets[i].seaport_sell_orders)[0];
      // const order = await retry(async (context) => {
      //  return getOrders(availableAssets[i])
      // }, retryOptions);
      let considerationToken =
        order.protocol_data.parameters.consideration[0].token;
      if (
        order === undefined ||
        (considerationToken != wethToken && considerationToken != ethToken)
      ) {
        continue;
      }
      if (considerationToken === ethToken) {
        considerationToken = "ETH";
      } else if (considerationToken === wethToken) {
        considerationToken = "WETH";
      }
      let offerItem = [];
      let amount = 0;
      for (let i of order.protocol_data.parameters.offer) {
        //transform object to string required in contract call
        let item = [];
        for (let j in i) {
          item.push(i[j]);
        }
        amount = item[3];
        offerItem.push(item);
      }
      let considerationItem = []; //transform object to string required in contract call
      let value = BigNumber(0);
      for (let i of order.protocol_data.parameters.consideration) {
        let item = [];
        for (let j in i) {
          item.push(i[j]);
        }
        considerationItem.push(item);
        value.plus(BigNumber(item[4]));
      }
      value.div(amount);
      console.log(
        "collection nftPrice: ",
        collection.nftPrice
      );
      const nftPrice = BigNumber(
        web3.utils.toWei(collection.nftPrice.toString().replaceAll(",", "."))
      );
      if (value.lte(nftPrice)) {
        //check if nft is in a price range
        console.log("found available offer");
        if (collection.mode === "auto") {
          class Order {
            constructor(protocolData, offerItem, considerationItem) {
              this.offerer = protocolData.parameters.offerer;
              this.zone = protocolData.parameters.zone;
              this.OfferItem = offerItem;
              this.ConsiderationItem = considerationItem;
              this.OrderType = protocolData.parameters.orderType;
              this.startTime = protocolData.parameters.startTime;
              this.endTime = protocolData.parameters.endTime;
              this.zoneHash = protocolData.parameters.zoneHash;
              this.salt = protocolData.parameters.salt;
              this.conduitKey =
                protocolData.parameters.conduitKey;
              this.totalOriginalConsiderationItems =
                protocolData.parameters.totalOriginalConsiderationItems;
            }
          }

          const orderObj = new Order(
            order.protocol_data,
            offerItem,
            considerationItem
          ); //create basic order parameters object
          let orderData = [];
          for (let i in orderObj) {
            //transform object
            orderData.push(orderObj[i]);
          }

          //For completing only basic orders or advanced orders with full completing
          // const newOrder = [orderData, order.protocolData.signature];
          // const res = await sendTx(newOrder, "0x", value.toString())//order.protocolData.parameters.conduitKey
          // console.log(res);

          class AdvancedOrder {
            //make an advanced order object from basic parameters
            constructor(basicOrder, order) {
              this.parameters = basicOrder;
              this.numerator = "1";
              this.denominator =
                order.protocol_data.parameters.offer[0].startAmount;
              this.signature = order.protocol_data.signature;
              this.extraData = "0x";
            }
          }

          let advancedOrderObj = new AdvancedOrder(orderData, order);
          let advancedOrder = [];
          for (let i in advancedOrderObj) {
            //transform to string
            advancedOrder.push(advancedOrderObj[i]);
          }
          console.log("formed adv order");
          console.log("value: ", value.toString());
          console.log('advanced order: ', advancedOrder);
          const nftName = availableAssets[i].name;
          const nftId =
            order.protocol_data.parameters.offer[0].identifierOrCriteria;
          const contractAddress = collection.assetContractAddress;
          let nftAddress = await retry(async (context) => {
            return getSignleAsset(nftId, contractAddress);
          }, retryOptions);
          const nftUri = `https://testnets.opensea.io/assets/rinkeby/${nftAddress}/${nftId}`;
          const signedTx = await signTx(advancedOrder, orderObj.conduitKey, value.toString(), considerationToken);
          console.log('formed tx');
          web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on('receipt', (receipt) => {
              let link =
                "https://rinkeby.etherscan.io/tx/" + receipt.transactionHash;
              let msg = `Была куплена nft <a href="${nftUri}">${nftName}</a> из коллекции ${
                collection.collectionSlug
              } за ${web3.utils.fromWei(
                value.toString()
              )} ETH, <a href="${link}">транзакция</a>`;
              bot.telegram.sendMessage(botConfig.chatId, msg, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
              });
            })
            .on('error', (err) => {
              console.log('hi from catch block ', Object.keys(err), err.receipt.transactionHash)
              link = "https://rinkeby.etherscan.io/tx/" + err.receipt.transactionHash;
              bot.telegram.sendMessage(botConfig.chatId, `Произошла ошибка при покупке nft <a href="${nftUri}">${nftName}</a>, <a href="${link}">транзакция</a>`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
              })
            }).catch(err => {
              console.log(err);
            });
        } else if (collection.mode === "manual") {
          const nftName = availableAssets[i].name;
          const slug = collection.collectionSlug;
          const collectionUri = `https://testnets.opensea.io/collection/${slug}`;
          const contractAddress = collection.assetContractAddress;
          const nftId =
            order.protocol_data.parameters.offer[0].identifierOrCriteria;
          console.log('дошло до формирования ссылки');
          console.log('id ', nftId, ' contract ',contractAddress)
          let nftAddress = await retry(async (context) => {
            return getSignleAsset(nftId, contractAddress);
          }, retryOptions);
          const nftUri = `https://testnets.opensea.io/assets/rinkeby/${nftAddress}/${nftId}`;
          console.log('chat id ', botConfig.chatId);
          const msg = `Можно купить nft <a href="${nftUri}">${nftName}</a> за ${web3.utils.fromWei(
            value.toString()
          )} ${considerationToken} из коллекции <a href="${collectionUri}">${slug}</a>`;
          await bot.telegram.sendMessage(botConfig.chatId, msg, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        }
      }
    }
  }
}

async function signTx(order, conduitKey, value, token) {
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const seaportContract = new web3.eth.Contract(
    seaportABI,
    "0x00000000006c3852cbef3e08e8df289169ede581"
  );
  let txData = seaportContract.methods
    .fulfillAdvancedOrder(order, [], conduitKey, zeroAddress)
    .encodeABI();
  let gasPrice = await web3.eth.getGasPrice();
  let gasAmount = await seaportContract.methods
    .fulfillAdvancedOrder(order, [], conduitKey, zeroAddress)
    .estimateGas({ from: account.address, gasPrice: gasPrice, value: value }).catch(err => {
      console.log('error estimating gas');
      return 150000
    });
  console.log('gas amount: ', gasAmount)
  if (token === 'WETH') {
    value = 0;
  }
  let tx = {
    from: account.address,
    to: seaportContract.options.address,
    value: value,
    gasPrice: gasPrice,
    gas: gasAmount,
    data: txData,
  };

  let signedTx = await account.signTransaction(tx);
  return signedTx;
}

async function getAssets(collectionSlug, next) {
  let assets;
  let error;
  await axios({
    method: "get",
    url: "https://testnets-api.opensea.io/api/v1/assets",
    params: {
      collection: collectionSlug,
      include_orders: "true",
      limit: 200,
      cursor: next,
    },
  })
    .then((res) => {
      assets = res.data;
    })
    .catch((err) => {
      error = err;
    });
  return new Promise((resolve, reject) => {
    if (!error) {
      resolve(assets);
    } else {
      reject(error);
    }
  });
}

//Can get orders from api for every asset, to set up change every protocol_data to protocolData
// async function getOrders(asset) {
//   const tokenId = asset.token_id;
//   const tokenAddress = asset.asset_contract.address;
//   let orders;
//   let error;
//   await openseaSDK.api.getOrders({
//       assetContractAddress: tokenAddress,
//       tokenId: BigNumber(tokenId),
//       side: "ask",
//       orderBy: "eth_price",
//       orderDirection: "asc",
//     })
//     .then((res) => {
//       orders = res.orders;
//     })
//     .catch((err) => {
//       error = err;
//     });
//   return new Promise((resolve, reject) => {
//     if (!error) {
//       resolve(orders[0]);
//     } else {
//       reject(error);
//     }
//   });
// }

async function getSignleAsset(tokenId, assetContractAddress) {
  let nftUri;
  let openStoreAddress = "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656";
  await sdk
    .retrievingASingleAssetTestnets({
      asset_contract_address: assetContractAddress,
      token_id: tokenId,
    })
    .then((res) => {
      console.log('нашло ассет ', res)
      nftUri = res.asset_contract.address;
    })
    .catch((err) => {
      console.log('не нашло ассет')
      nftUri = err;
    });
  return new Promise((resolve, reject) => {
    if (nftUri == assetContractAddress) {
      resolve(nftUri);
    } else if (nftUri.status === 404) {
      resolve(openStoreAddress);
    } else {
      reject(nftUri);
    }
  });
}

function sortAssets(assets) {
  let availableAssets = [];
  for (let i = 0; i < assets.length; i++) {
    if (assets[i].seaport_sell_orders != null) {
      availableAssets.push(assets[i]);
    }
  }
  return availableAssets;
}

function shellSort(arr) {
  let n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i += 1) {
      let temp = arr[i];
      let j;
      for (
        j = i;
        j >= gap &&
        Number(arr[j - gap].current_price) > Number(temp.current_price);
        j -= gap
      ) {
        arr[j] = arr[j - gap];
      }
      arr[j] = temp;
    }
  }
  return arr;
}

async function prepareAssets(collectionSlug) {
  console.log('collection slug: ', collectionSlug)
  let assetsArr = [];
  let assetsResponse = await retry(async (context) => {//for first page of assets
    return getAssets(collectionSlug, null);
  }, retryOptions);
  assetsArr.push(assetsResponse.assets);
  let next = assetsResponse.next;
  while (next !== null) { //while there are next assets pages
    let assetsResponse = await retry(async (context) => {
      return getAssets(collectionSlug, next);
    }, retryOptions);
    assetsArr.push(assetsResponse.assets);
    next = assetsResponse.next;
  }
  assetsArr = assetsArr.flat();
  console.log('assets arr: ', assetsArr.length)
  const availableAssets = sortAssets(assetsArr);
  console.log("found assets: ", availableAssets.length);
  return availableAssets
}

main();
