<script setup lang="ts">
const testimonials = ref([
  {
    user: {
      name: "Evan You",
      description: "Author of Vue.js and Vite",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/499550?v=4",
        alt: "Evan You",
      },
    },
    quote: "Nuxt on Cloudflare infra with minimal effort - this is huge!",
  },
  {
    user: {
      name: "Igor Minar",
      description: "Software Engineer at Cloudflare",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/216296?v=4",
        alt: "Igor Minar",
      },
    },
    quote: "I love the polish and the batteries-included approach. NuxtHub takes web framework and hosting integration to a new level!",
  },
  {
    user: {
      name: "Charlie Hield",
      description: "Senior Creative Technologist",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/527849?v=4",
        alt: "Charlie Hield",
      },
    },
    quote: "NuxtHub is hands down the easiest way to get a project from zero to production on the Cloudflare stack!",
  },
  {
    user: {
      name: "Israel Ortuño",
      description: "Co-founder of VueJobs",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/1769417?v=4",
        alt: "Israel Ortuño",
      },
    },
    quote: "I can't find an excuse to not go full-stack with Nuxt from now on. Ship fast the Nuxt way, zero config. Just plug & deploy.",
  },
  {
    user: {
      name: "Fayaz Ahmed",
      description: "Indie Hacker",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/15716057?v=4",
        alt: "Fayaz Ahmed",
      },
    },
    quote: "Took me less than 90 seconds to deploy an app with DB, KV, File storage and Caching, all on the edge with just a single command.",
  },
  {
    user: {
      name: "Tommy J. Vedvik",
      description: "UX Developer",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/48070?v=4",
        alt: "Tommy J. Vedvik",
      },
    },
    quote: "Nuxt is becoming the best framework for bootstrappers imo. NuxtHub is a layer on top of Cloudflare services for cheap & fast full-stack edge hosting.",
  },
]);
const items = [
  "images/food.webp",
  "images/food2.webp",
  "images/food3.webp",
  "images/food4.webp",
  "images/food5.webp",
  "images/food6.jpeg",
];

const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

function onClickPrev() {
  activeIndex.value--;
}
function onClickNext() {
  activeIndex.value++;
}
function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

const links = ref([
  {
    label: "Browse Recipes",
    to: "/recipes",
    icon: "i-lucide-book-open",
  },
  {
    label: "Learn Cooking Tips",
    to: "/learn",
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-lucide-arrow-right",
  },
]);
</script>

<template>
  <div class="flex-1 w-full">
    <UPageHero
      title="Discover Delicious Recipes"
      description="Explore a world of easy, healthy, and mouthwatering recipes made for every occasion. Learn to cook like a chef with step-by-step guides and expert cooking tips."
      headline="Your Daily Source of Inspiration" orientation="horizontal" reverse :links="links"
    >
      <img src="/images/food.webp" alt="Tasty homemade recipe" class="rounded-lg shadow-2xl ring ring-default">
    </UPageHero>

    <UCarousel
      ref="carousel" v-slot="{ item }" arrows :items="items" :prev="{ onClick: onClickPrev }"
      :next="{ onClick: onClickNext }" auto-scroll class="w-full max-w-xs mx-auto" @select="onSelect"
    >
      <img :src="item" width="320" height="320" class="rounded-lg">
    </UCarousel>

    <div class="flex gap-1 justify-between pt-4 max-w-xs mx-auto">
      <div
        v-for="(item, index) in items" :key="index" class="size-11 opacity-25 hover:opacity-100 transition-opacity"
        :class="{ 'opacity-100': activeIndex === index }" @click="select(index)"
      >
        <NuxtImg :src="item" width="44" height="44" class="rounded-lg" />
      </div>
    </div>

    <UPageColumns class="m-8">
      <UPageCard
        v-for="(testimonial, index) in testimonials" :key="index" variant="subtle"
        :description="testimonial.quote"
        :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
      >
        <template #footer>
          <UUser v-bind="testimonial.user" size="xl" />
        </template>
      </UPageCard>
    </UPageColumns>
  </div>
</template>
