<script setup lang="ts">
const testimonials = ref([
  {
    user: {
      name: "Gordon Ramsay",
      description: "Celebrity Chef",
      avatar: {
        src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Gordon_Ramsay.jpg",
        alt: "Gordon Ramsay",
      },
    },
    quote: "These recipes are amazing! Perfect for both beginners and professional chefs.",
  },
  {
    user: {
      name: "Selam Fikir",
      description: "Ethiopian Home Cook",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/68.jpg",
        alt: "Selam Fikir",
      },
    },
    quote: "I love how these recipes help me recreate traditional Ethiopian dishes easily at home.",
  },
  {
    user: {
      name: "Jamie Oliver",
      description: "Chef & Cookbook Author",
      avatar: {
        src: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jamie_Oliver_2009.jpg",
        alt: "Jamie Oliver",
      },
    },
    quote: "I love how these recipes make cooking healthy meals so easy and enjoyable.",
  },
  {
    user: {
      name: "Mekdes Alemu",
      description: "Ethiopian Food Blogger",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/72.jpg",
        alt: "Mekdes Alemu",
      },
    },
    quote: "I enjoy sharing these recipes with friends and family; they bring authentic flavors to the table.",
  },
  {
    user: {
      name: "Massimo Bottura",
      description: "Chef at Osteria Francescana",
      avatar: {
        src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Massimo_Bottura_2018.jpg",
        alt: "Massimo Bottura",
      },
    },
    quote: "The flavors are thoughtfully explained. These recipes inspire creativity in the kitchen.",
  },
  {
    user: {
      name: "Daniel Tesfaye",
      description: "Ethiopian Chef",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/65.jpg",
        alt: "Daniel Tesfaye",
      },
    },
    quote: "These recipes are a great way to introduce Ethiopian cuisine to the world.",
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
    to: "/chiefs",
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-lucide-arrow-right",
  },
]);
const query = gql`
query GetPerson {
  person {
    name
    age
    id
  }
}

`;
const variables = { limit: 5 };

const { data } = await useAsyncQuery(query, variables);
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
    <div class="flex justify-center items-center">
      <p>Testing Hasura Name: {{ data.person[0].name }}</p>
    </div>

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
