---
title: The Three Laws of a Symptom Fix - The Bug
subtitle: 'An overture in the illustrations of <a href="/the-three-laws-of-a-symptom-fix">The Three Laws of a Symptom Fix</a>'
description: This blog post explains the bug in the Split() extension method. The explanation is used in other posts to demonstrate The Three Laws of a Symptom Fix.
keywords: symptom fix
tags: bugs swissknife
---
##Illustrating the Laws
In [my last post]({% post_url 2015-04-17-the-three-laws-of-a-symptom-fix %}) on The Three Laws of a Symptom Fix I [promised to shortly explain]({% post_url 2015-04-17-the-three-laws-of-a-symptom-fix %}#examples-please) the [`Split<T>()`](https://github.com/ironcev/SwissKnife/blob/master/Source/SwissKnife/Collections/CollectionExtensions.cs) extension method and the bug behind its original implementation. This bug turned out to be a perfect example for demonstrating *The Thee Laws* and I will use it in my upcoming posts for the demonstration purpose.

Note that **The Thee Laws are universal**. They do not depend on the nature of a particular bug. They are also programming-language and platform agnostic. I'll use the concrete bug shown below just to illustrate them on a tangible example.

##The `Split<T>()` Method
Let's see first what the [`Split<T>()`](https://github.com/ironcev/SwissKnife/blob/master/Source/SwissKnife/Collections/CollectionExtensions.cs) extension method is doing and how it was implemented. That will help us to easily follow the examples that will be given in the upcoming posts.

The `enumerable.Split<T>(groupSize)` takes the `enumerable` and splits it into groups where each of them, except eventually the last one, has exactly the `groupSize` number of elements.

For example, if we define `numbers` as:

    var numbers = new [] { 1, 2, 3, 4, 5 };

splitting them into groups of different sizes will give us the following output:

    numbers.Split(1); // -> { {1}, {2}, {3}, {4}, {5} }
    numbers.Split(2); // -> { {1, 2}, {3, 4}, {5} }
    numbers.Split(3); // -> { {1, 2, 3} {4, 5} }
    numbers.Split(4); // -> { {1, 2, 3, 4}, {5} }
    numbers.Split(5); // -> { {1, 2, 3, 4, 5} }
    numbers.Split(6); // -> { {1, 2, 3, 4, 5} }

This was the original implementation of the method (comments and argument checks are removed for brevity):

<pre>
<code>public static IEnumerable&lt;IEnumerable&lt;T&gt;&gt; Split&lt;T&gt;
    (this IEnumerable&lt;T> <strong>source</strong>, int groupSize)
{
    return <strong>source</strong>
        .Where((x, i) => i % groupSize == 0)
        .Select(<em>(x, i) => 
            <strong>source</strong>
            .Skip(i * groupSize)
            .Take(groupSize)</em>);
}</code>
</pre>

Yes I agree - the implementation is a riddle on its own :-) It takes some time to figure out how the method works. For the rest of the discussion it is only important to notice that the `source` is enumerated in the inner scope, as a sub-query (the *emphasized* part of the code) of the query that enumerates the `source` itself. It sounds like something that will surely sooner or later cause problems, doesn't it ;-)

##The Bug
And now to the bug. The method, although very inefficiently implemented, worked perfectly with in-memory collections as well with queryables coming from [RavenDB](http://ravendb.net). Once it started to be used on queryables coming from the Entity Framework querying over SQL Server the following exception occurred: "*There is already an open DataReader associated with this Command which must be closed first.*"

As soon as I saw the exception I knew exactly where the problem was. The `source` was a queryable coming from the Entity Framework. When the enumeration started the Entity Framework internally created an SQL select command and started executing it. The command opened a data reader that started fetching the data.

When the enumeration hit the `Select` statement within the `Split()` method the same `source` queryable was asked to `Skip()` and `Take()` some elements. This request tried to execute a new data reader while the previous one was still open on the same connection.

In its standard configuration, SQL Server does not support more than one pending request on a given session. And therefore the exception.

##The Symptom Fix
Exactly like in the [Steve's conversation with the Microsoft programmer]({% post_url 2015-04-17-the-three-laws-of-a-symptom-fix %}), as soon as I saw the exception I knew that `ToArray()` will solve it, simply because I knew the internal implementation.

    // This will crash.
    someQueryable.Split(3);
    
    // And this will not.
    someQueryable.ToArray().Split(3);

Once `ToArray()` is called the `Split()` will operate on the in-memory array and this will always work.

A perfect symptom fix which will serve as a perfect illustration of [The Three Laws of a Symptom Fix]({% post_url 2015-04-17-the-three-laws-of-a-symptom-fix %}#the-three-laws)!

Here is the list of additional blog posts that use this symptom fix as a base for tangible examples of each of *The Laws*:

- [The Three Laws of a Symptom Fix - Removal and Reappearance]({% post_url 2015-04-23-the-three-laws-of-a-symptom-fix-removal-and-reappearance %})
- The Three Laws of a Symptom Fix - Mutation and Spreading (still to be written)
- The Three Laws of a Symptom Fix - One to Rule Them All (still to be written)