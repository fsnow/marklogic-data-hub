const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const merge = require('/data-hub/5/builtins/steps/mastering/default/merging.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];

function assertNoneDeepEqual(sequence, message, depth = 1) {
  const count = fn.count(sequence);
  //xdmp.log(count);
  if (count >= 2) {
    const head = fn.head(sequence);
    let n = 1;
    for (const item of fn.tail(sequence)) {
      //xdmp.log("assertNoneDeepEqual, items " + depth + " and " + (depth + n) );
      test.assertFalse(fn.deepEqual(item, head), message + ", Item " + depth + " equals item " + (depth + n) );
      n++;
    }
    if (count > 2) {
      assertNoneDeepEqual(fn.tail(sequence), message, depth + 1);
    }
  }
}

// Merges docs 1 and 2, no configured mergeRules or mergeStrategies,
// test for unique joined values for shipping and billing
function standardDefaultJsonMerge() {
  const content = { uri:'/content/matchSummaryMerge1_2.json' };
  const stepId = 'mergeCustomersStandard-merging';
  const results = merge.main(content, {stepId}).filter((doc) => {
    return doc.uri.includes('CustMerged');
  })[0].value;
  let instance = fn.head(results.xpath('//*:instance'));
  xdmp.log(instance);
  return assertions.concat([
    test.assertEqual(2, fn.count(instance.xpath('*')), `Should have 2 direct children of instance (es:info and instance). Results: ${xdmp.toJsonString(instance)}`),
    test.assertEqual(2, fn.count(instance.xpath('*/billing/object-node()')), `Should have 2 addresses in an array under billing. Results: ${xdmp.toJsonString(instance)}`),
    test.assertEqual(3, fn.count(instance.xpath('*/shipping/object-node()')), `Should have 3 addresses in the array under shipping because 2 out of 4 are the same. Results: ${xdmp.toJsonString(instance)}`),
    assertNoneDeepEqual(instance.xpath('*/shipping/object-node()'),`Shipping addresses should be unique. Results: ${xdmp.toJsonString(instance)}`)
  ]);
}

// mergeRules on shipping and billing with mergeStrategy of one source (source 2) and max sources 2.
// should get the shipping and billing addresses only from source 2 (doc 2)
function sourcesOneValsTwoJsonMerge() {
  const content = { uri:'/content/matchSummaryMerge1_2.json' };
  const stepId = 'mergeCustSourcesOneValsTwo-merging';
  const results = merge.main(content, {stepId}).filter((doc) => {
    return doc.uri.includes('CustMerged');
  })[0].value;
  let instance = fn.head(results.xpath('//*:instance'));
  xdmp.log(instance);
  return assertions.concat([
    test.assertEqual(1, fn.count(instance.xpath('*/billing/object-node()')), `oneSourceJsonMerge: Should have 1 address in an array under billing. Results: ${xdmp.toJsonString(instance)}`),
    test.assertEqual(2, fn.count(instance.xpath('*/shipping/object-node()')), `oneSourceJsonMerge: Should have 2 addresses in the array under shipping. Results: ${xdmp.toJsonString(instance)}`),
    assertNoneDeepEqual(instance.xpath('*/shipping/object-node()'),`Shipping addresses should be unique. Results: ${xdmp.toJsonString(instance)}`)
  ]);
}

/*
function testNamespacedXmlMerge() {
    const content = { uri:'/content/namespacedCustomerMatchSummary.json'};
    return testMerge(content, 'mergeNamespacedCustomers-merging');
}
*/

assertions
    .concat(standardDefaultJsonMerge())
    .concat(sourcesOneValsTwoJsonMerge());
