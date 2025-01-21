import React from "react";
import {Autocomplete, AutocompleteItem} from "@heroui/react";
import {useInfiniteScroll} from "@heroui/use-infinite-scroll";

export type Pokemon = {
  name: string;
  url: string;
};

export type UsePokemonListProps = {
  /** Delay to wait before fetching more items */
  fetchDelay?: number;
};

export function usePokemonList({fetchDelay = 0}: UsePokemonListProps = {}) {
  const [items, setItems] = React.useState<Pokemon[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const limit = 10; // Number of items per page, adjust as necessary

  const loadPokemon = async (currentOffset: number) => {
    const controller = new AbortController();
    const {signal} = controller;

    try {
      setIsLoading(true);

      if (offset > 0) {
        // Delay to simulate network latency
        await new Promise((resolve) => setTimeout(resolve, fetchDelay));
      }

      let res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`,
        {signal},
      );

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      let json = await res.json();

      setHasMore(json.next !== null);
      // Append new results to existing ones
      setItems((prevItems) => [...prevItems, ...json.results]);
    } catch (error) {
      // @ts-ignore
      if (error.name === "AbortError") {
        // eslint-disable-next-line no-console
        console.log("Fetch aborted");
      } else {
        // eslint-disable-next-line no-console
        console.error("There was an error with the fetch operation:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadPokemon(offset);
  }, []);

  const onLoadMore = () => {
    const newOffset = offset + limit;

    setOffset(newOffset);
    loadPokemon(newOffset);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
  };
}

export default function App() {
  const [isOpen, setIsOpen] = React.useState(false);
  const {items, hasMore, isLoading, onLoadMore} = usePokemonList({fetchDelay: 1500});

  const [, scrollerRef] = useInfiniteScroll({
    hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false, // We don't want to show the loader at the bottom of the list
    onLoadMore,
  });

  return (
    <Autocomplete
      className="max-w-xs"
      defaultItems={items}
      isLoading={isLoading}
      label="Pick a Pokemon"
      placeholder="Select a Pokemon"
      scrollRef={scrollerRef}
      variant="bordered"
      onOpenChange={setIsOpen}
    >
      {(item) => (
        <AutocompleteItem key={item.name} className="capitalize">
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}